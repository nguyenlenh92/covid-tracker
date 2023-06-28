from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, func, desc, and_
from sqlalchemy.sql.expression import case, join, true
from sqlalchemy.sql.functions import current_time
from sqlalchemy.sql.roles import GroupByRole
from sqlalchemy_utils import database_exists, create_database
from flask_migrate import Migrate, current
import os
import json
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)


from models import County
from models import State
from models import Case
from models import Death
from models import Vaccination
from models import Admin

engine = create_engine(os.environ['DATABASE_URL'])
if not database_exists(engine.url):
    create_database(engine.url)

with app.app_context():
    # db.drop_all()
    db.create_all()


def get_curr_time():
    try:
        query = db.session.query(Case.date).order_by(
            desc(Case.date)).group_by(Case.date)
        rows = db.session.execute(query).fetchone()
        dates = []
        for row in rows:
            dates.append(row)
        return(dates[0])
    except Exception as e:
        return (str(e))

current_date = get_curr_time()

if __name__ == '__main__':
    app.run()
    
@app.route("/", methods=['GET'])
def index():
    try:
        return jsonify(status="success")
    except Exception as e:
        return (str(e))

@app.route("/api/case-range", methods=['GET'])
def get_cases_in_range():
    min_day=request.args.get('min_day')
    max_day=request.args.get('max_day')
    county_fips=request.args.get('county_fips')
    state_fips=request.args.get('state_fips')
    if(not (min_day or max_day)):
        data = request.form.to_dict()
        min_day=data['min_day']
        max_day=data['max_day']
        county_fips=data['county_fips']
        state_fips=data['state_fips']
    try:
        if county_fips and not state_fips:
            latest = get_county_covid_cases(county_fips, max_day)
            earliest = get_county_covid_cases(county_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        elif state_fips and not county_fips:
            latest = get_state_covid_cases(state_fips, max_day)
            earliest = get_state_covid_cases(state_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        else:
            return jsonify({"error": 200, "msg":"Please enter either county fips or state fips"})
    except Exception as e:
	    return(str(e))

@app.route("/api/death-range", methods=['GET'])
def get_deaths_in_range():
    min_day = request.args.get('min_day')
    max_day = request.args.get('max_day')
    county_fips = request.args.get('county_fips')
    state_fips = request.args.get('state_fips')
    if(not (min_day or max_day)):
        data = request.form.to_dict()
        min_day = data['min_day']
        max_day = data['max_day']
        county_fips = data['county_fips']
        state_fips = data['state_fips']
    try:
        if county_fips and not state_fips:
            latest = get_county_death_cases(county_fips, max_day)
            earliest = get_county_death_cases(county_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        elif state_fips and not county_fips:
            latest = get_state_death_cases(state_fips, max_day)
            earliest = get_state_death_cases(state_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        else:
            return jsonify({"error": 200, "msg": "Please enter either county fips or state fips"})
    except Exception as e:
	    return(str(e))

@app.route("/api/vaccine-range", methods=['GET'])
def get_vaccines_in_range():
    min_day = request.args.get('min_day')
    max_day = request.args.get('max_day')
    county_fips = request.args.get('county_fips')
    state_fips = request.args.get('state_fips')
    if(not (min_day or max_day)):
        data = request.form.to_dict()
        min_day = data['min_day']
        max_day = data['max_day']
        county_fips = data['county_fips']
        state_fips = data['state_fips']
    try:
        if county_fips and not state_fips:
            latest = get_county_vaccine_cases(county_fips, max_day)
            earliest = get_county_vaccine_cases(county_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        elif state_fips and not county_fips:
            latest = get_state_vaccine_cases(state_fips, max_day)
            earliest = get_state_vaccine_cases(state_fips, min_day)
            return jsonify([earliest.get_json(), latest.get_json()])
        else:
            return jsonify({"error": 200, "msg": "Please enter either county fips or state fips"})
    except Exception as e:
	    return(str(e))

@app.route("/api/county/population/ranking/<state_fips>/<num>", methods=['GET'])
def get_county_population_ranking(state_fips, num):
    try:
        query = db.session.query(County.population.label("population"), County.name.label("county_name"), State.name.label("state_name")).\
            select_from(join(County, State)).\
                filter(County.state_fips==state_fips).\
                    order_by(County.name)
        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'population': row.population,
                         'state_name': row.state_name, 'county_name': row.county_name})
        return(jsonify(cases))
    except Exception as e:
        return (str(e))
       
@app.route("/api/county/cases/ranking/<state_fips>/", methods=['GET'])
def get_county_cases_ranking(state_fips):
    try:
        date = request.args.get('date')
        num = request.args.get('num')
        if not date:
            date = current_time
        else:
            date = datetime.datetime.strptime(date, '%Y-%m-%d')
            
        query = db.session.query(Case.cases, County.name.label("county_name"), State.name.label("state_name")).\
            select_from(join(Case, join(County, State))).\
                filter(County.state_fips==state_fips, Case.date == date).\
                    order_by(County.name)
        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'cases': row.cases, 'state_name': row.state_name, 'county_name': row.county_name})
        return(jsonify(cases))
    except Exception as e:
        return (str(e))
    
@app.route("/api/county/deaths/ranking/<state_fips>/<num>", methods=['GET'])
def get_county_deaths_ranking(state_fips, num):
    try:
        query = db.session.query(Death.cases.label("deaths"), County.name.label("county_name"), State.name.label("state_name")).\
            select_from(join(Death, join(County, State))).\
            filter(County.state_fips == state_fips, Death.date == current_date).\
            order_by(County.name)
        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'deaths': row.deaths, 'state_name': row.state_name, 'county_name': row.county_name})
        return(jsonify(cases))
    except Exception as e:
        return (str(e))
    

@app.route("/api/county/vaccines/ranking/<state_fips>/<int:num>", methods=['GET'])
def get_county_vaccines_ranking(state_fips, num):
    try:
        query = db.session.query(Vaccination.vaccines.label("vaccines"), County.name.label("county_name"), State.name.label("state_name")).\
            select_from(join(Vaccination, join(County, State))).\
            filter(County.state_fips == state_fips, Vaccination.date == current_date).\
            order_by(County.name)
        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append(
                {'vaccines': row.vaccines, 'state_name': row.state_name, 'county_name': row.county_name})
        return(jsonify(cases))
    except Exception as e:
        return (str(e))
    
@app.route("/api/state/population/ranking/<int:num>", methods=['GET'])
def get_state_population_ranking(num):
    try:
        query = db.session.query(State.name.label("state_name"), State.population.label("population")).\
            select_from(State).order_by(State.name)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'population': row.population, 'state_name': row.state_name})

        return(jsonify(cases))

    except Exception as e:
        return (str(e))   
    
@app.route("/api/state/cases/ranking", methods=['GET'])
def get_state_cases_ranking():
    try:
        date = request.args.get('date')
        num = request.args.get('num')
        if not date:
            date = current_time
        else:
            date = datetime.datetime.strptime(date, '%Y-%m-%d')
        query = db.session.query(State.name.label("state_name"), func.sum(Case.cases).label("cases")).select_from(
            join(Case, join(County, State))).filter(Case.date == date).order_by(State.name).group_by(State.name)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'cases': row.cases, 'state_name': row.state_name})

        return(jsonify(cases))

    except Exception as e:
        return (str(e))
    
    
@app.route("/api/state/deaths/ranking/<int:num>", methods=['GET'])
def get_state_deaths_ranking(num):
    try:
        query = db.session.query(State.name.label("state_name"), func.sum(Death.cases).label("deaths")).select_from(join(
            Death, join(County, State))).filter(Death.date == current_date).order_by(State.name).group_by(State.name)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'deaths': row.deaths, 'state_name': row.state_name})

        return(jsonify(cases))

    except Exception as e:
        return (str(e))
    

@app.route("/api/state/vaccines/ranking/<int:num>", methods=['GET'])
def get_state_vaccines_ranking(num):
    try:
        query = db.session.query(State.name.label("state_name"), func.sum(Vaccination.vaccines).label("vaccines")).select_from(join(
            Vaccination, join(County, State))).filter(Vaccination.date == current_date).order_by(State.name).group_by(State.name)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'vaccines': row.vaccines,
                         'state_name': row.state_name})

        return(jsonify(cases))

    except Exception as e:
        return (str(e))


@app.route("/api/state/vaccines_progress/ranking/<int:num>", methods=['GET'])
def get_state_vaccines_progress_ranking(num):
    try:
        query = db.session.query(State.name.label("state_name"), State.population.label("population"), func.sum(Vaccination.vaccines).label("cases")).select_from(join(
            Vaccination, join(County, State))).filter(Vaccination.date == current_date).order_by(desc(func.sum(Vaccination.vaccines))).group_by(State.name, State.population)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'progress': "{:.2f}".format(row.cases / row.population * 100), 'state_name': row.state_name})

        return(jsonify(sorted(cases, key=lambda x: x['progress'], reverse=True)))

    except Exception as e:
        return (str(e))

@app.route("/api/state/daily_new_case/ranking/<int:num>", methods=['GET'])
def get_state_daily_new_cases_ranking(num):
    try:
        query = db.session.query(State.name.label("state_name"), func.sum(Vaccination.vaccines).label("cases"), State.population.label("population")).select_from(join(
            Vaccination, join(County, State))).filter(Vaccination.date == current_date).order_by(desc(func.sum(Vaccination.vaccines))).group_by(State.name, State.population)

        rows = db.session.execute(query).fetchmany(int(num))
        cases = []
        for row in rows:
            cases.append({'progress': "{:.2f}".format(
                row.cases / row.population * 100), 'state_name': row.state_name})

        return(jsonify(cases=cases))

    except Exception as e:
        return (str(e))    

@app.route("/api/state/vaccines_graph/<state_fips>", methods=['GET'])
def get_state_vaccine(state_fips):
    try:
        query = db.session.query(
            Vaccination.date,func.sum(Vaccination.vaccines).label("cases")).select_from(join(Vaccination, County)).group_by(Vaccination.date).filter(County.state_fips == state_fips).order_by(Vaccination.date)
        rows = db.session.execute(query).fetchall()
        results = []
        for row in rows:
            results.append({'cases': row[1], 'date':row[0]})
        return jsonify(cases=results)
    except Exception as e:
        return (str(e))
    

@app.route("/api/state/deaths_graph/<state_fips>", methods=['GET'])
def get_state_deaths(state_fips):
    try:
        query = db.session.query(
            Death.date, func.sum(Death.cases)).select_from(join(Death, County)).group_by(Death.date).filter(County.state_fips == state_fips).order_by(Death.date)
        rows = db.session.execute(query).fetchall()
        results = []
        for row in rows:
            results.append({'cases': row[1], 'date': row[0]})
        return jsonify(cases=results)
    except Exception as e:
        return (str(e))
    

@app.route("/api/state/cases_graph/<state_fips>", methods=['GET'])
def get_state_cases(state_fips):
    try:
        query = db.session.query(
            Case.date, func.sum(Case.cases)).select_from(join(Case, County)).group_by(Case.date).filter(County.state_fips == state_fips).order_by(Case.date)
        rows = db.session.execute(query).fetchall()
        results = []
        for row in rows:
            results.append({'cases': row[1], 'date': row[0]})
        return jsonify(cases=results)
    except Exception as e:
        return (str(e))

@app.route("/api/admin/new", methods=['GET', 'POST'])
def create_admin(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        admin=Admin(
            username=json_raw['username'],
            password=generate_password_hash(json_raw['password'])
        )
        db.session.add(admin)
        db.session.commit()
        return jsonify(admin.serialize())
    elif request.method == 'POST':
        data = request.form.to_dict()
        admin=Admin(
            username=data['username'],
            password=generate_password_hash(data['password'])
        )
        db.session.add(admin)
        db.session.commit()
        return jsonify(admin.serialize())
    else:
        username=request.args.get('username')
        password=request.args.get('password')
        try:
            admin=Admin(
                username=username,
                password=generate_password_hash(password)
            )
            db.session.add(admin)
            db.session.commit()
            return jsonify(admin.serialize())
        except Exception as e:
            return(str(e))

@app.route('/api/admin/login', methods=['GET', 'POST'])
def login_user():
    if request.method == 'POST':
        data = request.form.to_dict()
        admin = Admin.query.filter_by(username=data['username']).first()

        if admin and check_password_hash(admin.password, data['password']):
            return jsonify(success=True)
        else:
            return jsonify({'error': 'Username or password is incorrect'}), 401
    else:
        username=request.args.get('username')
        password=request.args.get('password')
        admin = Admin.query.filter_by(username=username).first()

        if admin and check_password_hash(admin.password, password):
            return jsonify(success=True)
        else:
            return jsonify({'error': 'Username or password is incorrect'}), 401

@app.route("/api/admin/<id_>")
def get_admin(id_):
    try:
        admin=Admin.query.filter_by(id=id_).first()
        return jsonify(admin.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/admin/update/<id_>", methods=['GET','PUT'])
def update_admin(id_):
    username=request.args.get('username')
    password=request.args.get('password')
    try:
        admin=Admin.query.filter_by(id=id_).first()
        if(username is not None):
            admin.username = username
        if(password is not None):
            admin.password = password
        db.session.commit()
        return jsonify(admin.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/admin/delete/<id_>", methods=['GET','DELETE'])
def delete_admin(id_):
    try:
        admin=Admin.query.filter_by(id=id_).first()
        db.session.delete(admin)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))

@app.route("/api/county/covid-cases/<county_fips>", methods=['GET'])
def get_county_covid_cases(county_fips, date=current_date):
    try:
        case = Case.query.filter_by(county_fips=county_fips, date=date).first()
        return jsonify(case.serialize())
    except Exception as e:
        return (str(e))

@app.route("/api/county/death-cases/<county_fips>", methods=['GET'])
def get_county_death_cases(county_fips, date=current_date):
    try:
        deaths = Death.query.filter_by(county_fips=county_fips, date=date).first()
        return jsonify(deaths.serialize())
    except Exception as e:
        return (str(e))

@app.route("/api/county/vaccine-cases/<county_fips>", methods=['GET'])
def get_county_vaccine_cases(county_fips, date=current_date):
    try:
        vaccines = Vaccination.query.filter_by(county_fips=county_fips, date=date).first()
        return jsonify(vaccines.serialize())
    except Exception as e:
        return (str(e))

@app.route("/api/state/covid-cases/<state_fips>", methods=['GET'])
def get_state_covid_cases(state_fips, date=current_date):
    try:
        query = db.session.query(func.sum(Case.cases)).\
            select_from(join(Case, County)).\
                filter(County.state_fips == state_fips, Case.date == date)
        rows = db.session.execute(query).fetchall()
        for row in rows:
            data = row[0]
        return jsonify(cases=data)
    except Exception as e:
        return (str(e))


@app.route("/api/state/death-cases/<state_fips>", methods=['GET'])
def get_state_death_cases(state_fips, date=current_date):
    try:
        query = db.session.query(func.sum(Death.cases)).\
            select_from(join(Death, County)).\
                filter(County.state_fips == state_fips, Death.date == date)
        rows = db.session.execute(query).fetchall()
        for row in rows:
            data = row[0]
        return jsonify(cases=data)
    except Exception as e:
        return (str(e))

@app.route("/api/state/vaccine-cases/<state_fips>", methods=['GET'])
def get_state_vaccine_cases(state_fips, date=current_date):
    try:
        query = db.session.query(func.sum(Vaccination.vaccines)).\
            select_from(join(Vaccination, County)).\
                filter(County.state_fips == state_fips, Vaccination.date == date)
        rows = db.session.execute(query).fetchall()
        for row in rows:
            data = row[0]
        return jsonify(cases=data)
    except Exception as e:
        return (str(e))

@app.route("/api/state/new", methods=['GET', 'POST'])
def create_state(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        state=State(
            state_fips=json_raw['state_fips'],
            name=json_raw['name'],
            population=json_raw['population']
        )
        db.session.add(state)
        db.session.commit()
        return jsonify(state.serialize())
    elif request.method == 'POST':
        data = request.form.to_dict()
        state=State(
            state_fips=data['state_fips'],
            name=data['name'],
            population=data['population']
        )
        db.session.add(state)
        db.session.commit()
        return jsonify(state.serialize())
    else:
        state_fips=request.args.get('state_fips')
        name=request.args.get('name')
        population=request.args.get('population')
        try:
            state=State(
                state_fips=state_fips,
                name=name,
                population=population
            )
            db.session.add(state)
            db.session.commit()
            return jsonify(state.serialize())
        except Exception as e:
    	    return(str(e))

@app.route("/api/state/<state_fips>")
def get_state(state_fips):
    try:
        state=State.query.filter_by(state_fips=state_fips).first()
        return jsonify(state.serialize())
    except Exception as e:
	    return(str(e))

@app.route("/api/state/update/<state_fips>", methods=['GET','PUT'])
def update_state(state_fips):
    state_fips = None
    name = None
    population = None

    if request.method == 'GET':
        state_fips=request.args.get('state_fips')
        name=request.args.get('name')
        population=request.args.get('population')

    elif request.method == 'PUT':
        state_fips=request.form['state_fips']
        name=request.form['name']
        population=request.form['population']
    try:
        state=State.query.filter_by(state_fips=state_fips).first()
        if(state_fips is not None):
            state.state_fips = state_fips
        if(name is not None):
            state.name = name
        if(population is not None):
            state.population = population
        db.session.commit()
        return jsonify(state.serialize())
    except Exception as e:
	    return(str(e))

@app.route("/api/state/delete/<state_fips>", methods=['GET','DELETE'])
def delete_state(state_fips):
    try:
        state=State.query.filter_by(state_fips=state_fips).first()
        db.session.delete(state)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))

@app.route("/api/county/new", methods=['GET', 'POST'])
def create_county(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        county=County(
            name=json_raw['name'],
            county_fips=json_raw['county_fips'],
            population=json_raw['population'],
            state_fips=json_raw['state_fips']
        )
        db.session.add(county)
        db.session.commit()
        return jsonify(county.serialize())
    elif request.method == 'POST':
        data = request.form.to_dict()
        county=County(
            name=data['name'],
            county_fips=data['county_fips'],
            population=data['population'],
            state_fips=data['state_fips']
        )
        db.session.add(county)
        db.session.commit()
        return jsonify(county.serialize())
    else:
        name=request.args.get('name')
        county_fips=request.args.get('county_fips')
        population=request.args.get('population')
        state_fips=request.args.get('state_fips')
        try:
            county=County(
                name=name,
                county_fips=county_fips,
                population=population,
                state_fips=state_fips
            )
            db.session.add(county)
            db.session.commit()
            return jsonify(county.serialize())
        except Exception as e:
    	    return(str(e))

@app.route("/api/county/<county_fips>")
def get_county(county_fips):
    try:
        county=County.query.filter_by(county_fips=county_fips).first()
        return jsonify(county.serialize())
    except Exception as e:
	    return(str(e))

@app.route("/api/county/update/<county_fips>", methods=['GET','PUT'])
def update_county(county_fips):
    name, county_fips, population, state_fips = None

    if (request.method == "GET"):
        name=request.form.get('name')
        county_fips=request.args.get('county_fips')
        population=request.args.get('population')
        state_fips=request.args.get('state_fips')

    elif (request.method == "PUT"):
        name=request.form['name']
        county_fips=request.form['county_fips']
        population=request.form['population']
        state_fips=request.form['state_fips']

    try:
        county=County.query.filter_by(county_fips=county_fips).first()
        if(name is not None):
            county.name = name
        if(county_fips is not None):
            county.county_fips = county_fips
        if(population is not None):
            county.population = population
        if(state_fips is not None):
            county.state_fips = state_fips
        db.session.commit()
        return jsonify(county.serialize())
    except Exception as e:
	    return(str(e))

@app.route("/api/county/delete/<county_fips>", methods=['GET','DELETE'])
def delete_county(county_fips):
    try:
        county=County.query.filter_by(county_fips=county_fips).first()
        db.session.delete(county)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))

@app.route("/api/location/", methods=['GET'])
def get_location():
    try:
        query = db.session.query(State.name.label("state_name"), County.name.label("county_name")).select_from(join(State, County))
        rows = db.session.execute(query).fetchall()
        locations = []
        for row in rows:
            locations.append(row.county_name + ', ' + row.state_name)

        # query = db.session.query(State.name.label("state_name")).select_from(State)
        # rows = db.session.execute(query).fetchall()
        # for row in rows:
        #     locations.append(row.state_name)

        return(jsonify([location for location in locations]))

    except Exception as e:
        return(str(e))

@app.route("/api/cases/new", methods=['GET', 'POST'])
def create_case(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        case=Case(
            date=json_raw['date'],
            county_fips=json_raw['county_fips'],
            cases=json_raw['cases']
        )
        db.session.add(case)
        db.session.commit()
        return jsonify(case.serialize())
    elif request.method == 'POST':
        print('Tatu was here!')
        data = request.form.to_dict()
        if (data == {}):
            print('Iz Empty')
            data = request.get_json(force=True)
        print(data)
        case=Case(
            date=data['date'],
            county_fips=data['county_fips'],
            cases=data['cases']
        )
        db.session.add(case)
        db.session.commit()
        return jsonify(case.serialize())
    else:
        date=request.args.get['date'],
        county_fips=request.args.get['county_fips'],
        cases=request.args.get['cases']
        try:
            case=Case(
                date=date,
                cases=cases,
                county_fips=county_fips
            )
            db.session.add(case)
            db.session.commit()
            return jsonify(case.serialize())
        except Exception as e:
            return(str(e))

@app.route("/api/cases/<county_fips_>")
def read_case(county_fips_):
    try:
        case=Case.query.filter_by(county_fips=county_fips_).first()
        return jsonify(case.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/cases/update/<id_>", methods=['GET','PUT'])
def update_case(id_):
    date=request.args.get('date')
    cases=request.args.get('cases')
    if(date is None and cases is None):
        data = request.get_json(force=True)
        date=data['date']
        cases=data['cases']
    try:
        case=Case.query.filter_by(id=id_).first()
        if(date is not None and date != ''):
            case.date = date
        if(cases is not None and cases != ''):
            case.cases = cases
        db.session.commit()
        return jsonify(case.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/cases/delete/<id_>", methods=['GET','DELETE'])
def delete_case(id_):
    try:
        case=Case.query.filter_by(id=id_).first()
        db.session.delete(case)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))
    
@app.route("/api/vaccines/new", methods=['GET', 'POST'])
def create_vaccine(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        vaccination=Vaccination(
            date=json_raw['date'],
            county_fips=json_raw['county_fips'],
            vaccines=json_raw['cases']
        )
        db.session.add(vaccination)
        db.session.commit()
        return jsonify(vaccination.serialize())
    elif request.method == 'POST':
        # print('Tatu was here!')
        data = request.form.to_dict()
        if (data == {}):
            print('Iz Empty')
            data = request.get_json(force=True)
        print(data)
        vaccination=Vaccination(
            date=data['date'],
            county_fips=data['county_fips'],
            vaccines=data['cases']
        )
        db.session.add(vaccination)
        db.session.commit()
        return jsonify(vaccination.serialize())
    else:
        date=request.args.get['date'],
        county_fips=request.args.get['county_fips'],
        cases=request.args.get['cases']
        try:
            vaccination=Vaccination(
                date=date,
                vaccines=cases,
                county_fips=county_fips
            )
            db.session.add(vaccination)
            db.session.commit()
            return jsonify(vaccination.serialize())
        except Exception as e:
            return(str(e))

@app.route("/api/vaccines/<county_fips_>")
def read_vaccine(county_fips_):
    try:
        vaccine=Vaccination.query.filter_by(county_fips=county_fips_).first()
        return jsonify(vaccine.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/vaccines/update/<id_>", methods=['GET','PUT'])
def update_vaccine(id_):
    date=request.args.get('date')
    cases=request.args.get('cases')
    if(date is None and cases is None):
        data = request.get_json(force=True)
        date=data['date']
        cases=data['cases']
    try:
        vaccination=Vaccination.query.filter_by(id=id_).first()
        if(date is not None and date != ''):
            vaccination.date = date
        if(cases is not None and cases != ''):
            vaccination.vaccines = cases
        db.session.commit()
        return jsonify(vaccination.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/vaccines/delete/<id_>", methods=['GET','DELETE'])
def delete_vaccine(id_):
    try:
        vaccination=Vaccination.query.filter_by(id=id_).first()
        db.session.delete(vaccination)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))
    
@app.route("/api/deaths/new", methods=['GET', 'POST'])
def create_death(json_string=""):
    if(json_string != ""):
        json_raw = json.loads(json_string)
        death=Death(
            date=json_raw['date'],
            county_fips=json_raw['county_fips'],
            cases=json_raw['cases']
        )
        db.session.add(death)
        return jsonify(death.serialize())
    elif request.method == 'POST':
        # print('Tatu was here!')
        data = request.form.to_dict()
        if (data == {}):
            print('Iz Empty')
            data = request.get_json(force=True)
        print(data)
        death=Death(
            date=data['date'],
            county_fips=data['county_fips'],
            cases=data['cases']
        )
        db.session.add(death)
        db.session.commit()
        return jsonify(death.serialize())
    else:
        date=request.args.get['date'],
        county_fips=request.args.get['county_fips'],
        cases=request.args.get['cases']
        try:
            death=Death(
                date=date,
                cases=cases,
                county_fips=county_fips
            )
            db.session.add(death)
            db.session.commit()
            return jsonify(death.serialize())
        except Exception as e:
            return(str(e))

@app.route("/api/deaths/<county_fips_>")
def read_death(county_fips_):
    try:
        death=Death.query.filter_by(county_fips=county_fips_).first()
        return jsonify(death.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/deaths/update/<id_>", methods=['GET','PUT'])
def update_death(id_):
    date=request.args.get('date')
    cases=request.args.get('cases')
    if(date is None and cases is None):
        data = request.get_json(force=True)
        date=data['date']
        cases=data['cases']
    try:
        death=Death.query.filter_by(id=id_).first()
        if(date is not None and date != ''):
            death.date = date
        if(cases is not None and cases != ''):
            death.cases = cases
        db.session.commit()
        return jsonify(death.serialize())
    except Exception as e:
        return(str(e))

@app.route("/api/deaths/delete/<id_>", methods=['GET','DELETE'])
def delete_death(id_):
    try:
        death=Death.query.filter_by(id=id_).first()
        db.session.delete(death)
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        return(str(e))
    
@app.route("/api/location/search/<location_name>", methods=['GET'])
def search_location(location_name):
    try:
        location_name = location_name.split(", ")
        county_name, state_name = location_name
        
        query = db.session.query(County.county_fips, County.state_fips).select_from(join(State, County)).filter(County.name == county_name, State.name == state_name)
        rows = db.session.execute(query).fetchone()
        return jsonify(county_fips=rows[0], state_fips=rows[1])
        
    except Exception as e:
        return(str(e))
    

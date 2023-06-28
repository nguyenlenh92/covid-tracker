from server import db

class State(db.Model):
    __tablename__ = 'states'

    state_fips = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    population = db.Column(db.Integer)

    counties = db.relationship('County', backref='state')

    def __init__(self, state_fips, name, population):
        self.state_fips = state_fips
        self.name = name
        self.population = population

    def __repr__(self):
        return '<id {}>'.format(self.state_fips)

    def serialize(self):
        return {
            'state_fips': self.state_fips,
            'name': self.name,
            'population': self.population
        }

class County(db.Model):
    __tablename__ = 'counties'

    county_fips = db.Column(db.Integer, primary_key=True)
    state_fips = db.Column(db.Integer, db.ForeignKey('states.state_fips'))
    name = db.Column(db.String())
    population = db.Column(db.Integer)

    cases = db.relationship('Case', backref='county')
    deaths = db.relationship('Death', backref='county')
    vaccinations = db.relationship('Vaccination', backref='county')

    def __init__(self, name, county_fips, population, state_fips):
        self.county_fips = county_fips
        self.state_fips = state_fips
        self.name = name
        self.population = population


    def __repr__(self):
        return '<id {}>'.format(self.id)

    def serialize(self):
        return {
            'county_fips': self.county_fips,
            'state_fips': self.state_fips,
            'name': self.name,
            'population': self.population

        }

class Case(db.Model):
    __tablename__ = 'cases'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    county_fips = db.Column(db.Integer, db.ForeignKey('counties.county_fips'))
    cases = db.Column(db.Integer)


    def __init__(self, date, cases, county_fips):
        self.date = date
        self.county_fips = county_fips
        self.cases = cases

    def __repr__(self):
        return '<id {}>'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'date': self.date,
            'county_fips': self.county_fips,
            'cases': self.cases
        }

class Death(db.Model):
    __tablename__ = 'deaths'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    county_fips = db.Column(db.Integer, db.ForeignKey('counties.county_fips'))
    cases = db.Column(db.Integer)

    def __init__(self, date, cases, county_fips):
        self.date = date
        self.county_fips = county_fips
        self.cases = cases


    def __repr__(self):
        return '<id {}>'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'date': self.date,
            'county_fips': self.county_fips,
            'cases': self.cases
        }

class Vaccination(db.Model):
    __tablename__ = 'vaccinations'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    county_fips = db.Column(db.Integer, db.ForeignKey('counties.county_fips'))
    vaccines = db.Column(db.Integer)


    def __init__(self, date, vaccines, county_fips):
        self.date = date
        self.county_fips = county_fips
        self.vaccines = vaccines

    def __repr__(self):
        return '<id {}>'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'date': self.date,
            'county_fips': self.county_fips,
            'cases': self.vaccines
        }

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String())
    password = db.Column(db.String())

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<id {}>'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password
        }

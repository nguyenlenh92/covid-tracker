COPY public.states(state_fips, name, population)
FROM 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\states.csv'
DELIMITER ','
CSV HEADER;

COPY public.counties(county_fips, state_fips, name, population)
FROM 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\state_counties.csv'
DELIMITER ','
CSV HEADER;

COPY public.cases(date, county_fips, cases)
FROM 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\cases.csv'
DELIMITER ','
CSV HEADER;

COPY public.deaths(date, county_fips, cases)
FROM 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\deaths.csv'
DELIMITER ','
CSV HEADER;

COPY public.vaccinations(date, county_fips, vaccines)
FROM 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\vaccine.csv'
DELIMITER ','
CSV HEADER;
\copy public.states(state_fips, name, population) from 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\states.csv' csv header;
\copy public.counties(county_fips, state_fips, name, population) from 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\state_counties.csv' csv header;
\copy public.cases(date, county_fips, cases) from 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\cases.csv' csv header;
\copy public.deaths(date, county_fips, cases) from 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\deaths.csv' csv header;
\copy public.vaccinations(date, county_fips, vaccines) from 'C:\Users\nguye\Desktop\covid-tracker\server\backend\data_files\vaccine.csv' csv header;
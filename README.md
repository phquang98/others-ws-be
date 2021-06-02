# Testing MySQL with TS

Backend/Server Part

## Installation

- make sure you have VSCode and NodeJS installed on your machine
- have access to VAMK school network
  - if you are outside of VAMK school's network, you must have VPN connection like EduVPN
- login to `mysql.cc.puv.fi`
  - create a Database on there with your desired name, e.g: e1601130_test_ne
  - changes the database name in the `db_scripts.sql` -> import it into `mysql.cc.puv.fi`
- create an `.env` file based on the `.env.example` file
  - use the name of the DB and your credentials when logging into `mysql.cc.puv.fi`
- open a console from where you put this server -> `npm i`
- after that, run `npm run build` to output the server files, IGNORE THE ERROR
- then open the next console with the same location -> `npm start`
  - if you see some logs in the console, the server is ready, move to the Front End part

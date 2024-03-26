## Description

This is a simple rest API that allows an authorized user to add new user and get users details by ID.
Only a logged-in admin user can add a new user. We have two roles namely ADMIN and USER. A USER can only get their profile.
When a new user is created a notification is sent to the user by logging the details in the console with a random password created for the user. By default an admin user is seeded in the database and a new password is generated and logged in the console at every start-up of the application.

To get authorized, a sign-in endpoint has been created /api/v1/sign-in. Below is a sample payload

{
    "email":"test@email.com",
    "password": "******"
}

## Technologies
- Node version 20.11.1
- mysql
- ORM: Sequelize
- NestJs framework

## Installation

After cloning the repository, do the following

```bash
$ npm install
```
Copy the env.example file and use as a template for your .env file. Input your credentials. Don't change the default admin user email value because that is the same email in the database seed. Also, input the database credentials in the config.json file in the database folder.

```bash
$ npm run db:migrate
```
```bash
$ npm run db:seed
```

## Running the app

```bash
# development
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test
```


#!/bin/sh
npx knex migrate:latest
npx knex seed:run


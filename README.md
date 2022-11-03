P1 : Node Js assignment with PostgreSql

Create a PSQL database
Create two tables; one for the topics, and another for the ranking scale
topic is a string, ranking is in between 1-100
Design a schema for these tables
Install PostreSql on local device and connect with your project, create tables in
that
Create a Node + Express App:
With a GET route that displays your assessment for each topic (how you think
you rank).
With a POST route that allows you to change your ranking for each topic.
In the above POST Request, make a middleware to validate request that
ranking should be in between 1 to 100 and topic should not be empty
Throw different error on exception like for illegal request - 501



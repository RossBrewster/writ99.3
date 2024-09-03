Creating modules for repository Classes allows for use within ../app.module.ts

Create a new folder in the module's namesake.

The module should be exported with the following convention: "<YourModule'sName>Module". 

Create a controller, service, and module file for each new module.

Import the module to ../app.module.ts

Add the module to the imports array.

Do not add the modules to the entities array within the TypeOrmModule import.
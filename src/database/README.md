for development, database migrations will follow the following steps.

1. Alter the .entity.ts files to match the desired db structure.

2. After all of the enitites are properly configured by relation, create a migration script.

3. Run the migration script.

4. Import all new entities to the ../app.module.ts file.

5. Add all Entity Classes to the imports array in ../app.module.ts




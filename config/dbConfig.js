const sequelize = require("./sequelize");
const fs = require("fs");
const csvparser = require("csv-parser");
const Account = require("../models/account");
const {
  standardOutputLogger,
  standardErrorLogger,
} = require("../utils/logger");
// const createDatabase = require("./dbCreate");

async function configureDatabase() {
  try {
    let isDatabaseSynced = false;
    await sequelize
      .sync({
        alter: true,
        dialectOptions: {
          createDatabase: true,
        },
      })
      .then((isDatabaseSynced = true));
    console.log("Database sync completed successfully.");
    standardOutputLogger.info("Database sync completed successfully.");
    try {
      if (isDatabaseSynced) {
        const csvPath = "./resources/users.csv";
        const data = [];
        fs.createReadStream(csvPath)
          .pipe(csvparser())
          .on("data", async (row) => {
            try {
              const [user, created] = await Account.findOrCreate({
                where: { email: row.email },
                defaults: row,
              });
            } catch (error) {
              console.error(
                `Error while processing row with email ${row.email}:\n`,
                error
              );

              standardErrorLogger.error(
                `Error while processing row with email ${row.email}:\n`,
                error
              );
            }
          })
          .on("end", () => {
            console.log("CSV processing completed.");
            standardOutputLogger.info("CSV processing completed.");
          });
      }
      // isDatabaseSynced = true;
      console.log("Users added successfully.");
      standardOutputLogger.info("Users added successfully.");
    } catch (error) {
      console.error("Error while adding users:\n", error);
      standardErrorLogger.error("Error while adding users:\n", error);
    }

    // Close the connection
    // await sequelize.close();
    // console.log("Connection closed.");
  } catch (error) {
    console.error("Error while syncing database:\n", error);
    standardErrorLogger.error("Error while syncing database:\n", error);
  }
}

module.exports = configureDatabase;

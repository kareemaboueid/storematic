const express = require("express");
const { StatusCodes } = require("http-status-codes");
const UtlApiError = require("../utils/api-error.util");
const { database_query } = require("../database/db-client.database");

const router_check_health = express.Router();

router_check_health.get("/", async (p_request, p_response, p_next) => {
  try {
    // Simple DB probe: if this fails, DB is not reachable
    const db_result = await database_query("SELECT 1 AS DB_OK");

    const db_ok =
      Array.isArray(db_result.rows) && db_result.rows.length > 0 && db_result.rows[0].db_ok === 1;

    p_response.status(StatusCodes.OK).json({
      status: "OK",
      db: db_ok ? "UP" : "UNKNOWN",
    });
  } catch (p_error) {
    // If DB is down, bubble error to our error middleware
    p_next(
      new UtlApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Database health check failed",
        false,
        p_error.stack,
      ),
    );
  }
});

module.exports = router_check_health;

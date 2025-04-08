"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RequestStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RequestStatus.belongsTo(models.User, {
        as: "Patient",
        foreignKey: "patientId",
      });
      RequestStatus.belongsTo(models.User, {
        as: "Donor",
        foreignKey: "donorId",
      });
      RequestStatus.belongsTo(models.Request, {
        foreignKey: "requestId",
      });
    }
  }
  RequestStatus.init(
    {
      requestId: DataTypes.INTEGER,
      patientId: DataTypes.INTEGER,
      donorId: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RequestStatus",
    }
  );
  return RequestStatus;
};

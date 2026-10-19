import mongoose from 'mongoose'

/**
 * Connects mongoose to MongoDB.
 *
 * @param {string} connectionString - Such as "mongodb://localhost:27017/tea-shop".
 * @returns {Promise<mongoose.Mongoose>} The connected mongoose.
 */
export const connectToDatabase = async (connectionString) => {
  return mongoose.connect(connectionString)
}

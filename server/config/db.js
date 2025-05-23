const mongoose = require('mongoose');
const connectDB = async ()=>{
    try{
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.mongodb_uri);
        console.log(`Database Conncted: ${conn.connection.host}`)
    }
    catch(error){
        console.log(error);
    }
}

module.exports = connectDB;
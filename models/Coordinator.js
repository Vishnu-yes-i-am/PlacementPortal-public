const { default: mongoose } = require('mongoose')
const mongo = require('mongoose')
var selected = mongoose.Schema({ id: String, domain: String }, { _id : false });

const CoordinatorSchema = new mongo.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name !"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  gender: String,
  profile_image: String,
  mobile: String,
  qualification: String,
  role: Number,
  position: String,
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
  },
  inbox: [{ msgId: Number, body: String, date: Date, title: String, from: { name: String, id: String, domain: String }, readstatus: { type: Boolean, default: 0 } }],
  passwordChangedAt: Date,
  resetPasswordToken: {type: String, required: false},
  resetPasswordExpires: {type: Date, required:false},
  temp_token: String,
  checkBox: [selected]
});
module.exports = mongoose.model("Coordinator", CoordinatorSchema);

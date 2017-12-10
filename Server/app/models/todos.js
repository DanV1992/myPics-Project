var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

priorities = ['Low', 'Medium', 'High', 'Critical'];

var TodoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    todo: { type: String, required: true },
    description: { type: String, required: true, },
    dateCreated: { type: Date,  default: Date.now },
    dateDue: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    priority: { type: String },
    file: {
        filename: { type: String},
        originalName: { type: String},
        dateUploaded: { type: Date, default: Date.now }
    }
});

TodoSchema.virtual('fullName')
    .get(function () {
        return this.firstName + ' ' + this.lastName;
    });

    module.exports = Mongoose.model('ToDo', TodoSchema);
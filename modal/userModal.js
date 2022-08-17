const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    password: {
        type: String,
        required: true
    },

    stripCustomerId:{
        type: String,
        required: true 
    },
    
    trackingToken: {
        type: String
    },

    transunion:
    {
        pdf:
        {
            account_pdf: {
                type: String,
            },
            inquiry_pdf: {
                type: String,
            },

        },

        create_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        sent_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },

    experian:
    {
        pdf:
        {
            account_pdf: {
                type: String,
            },
            inquiry_pdf: {
                type: String,
            },

        },

        create_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        sent_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },

    equifax:
    {
        pdf: 
            {
                account_pdf : {
                     type: String,
                },
                inquiry_pdf : {
                  type: String ,
                },
              
            },
        
        create_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        sent_date: [
            {
                data: { type: String },
                status: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },



    document: {
        proof_of_address: { type: String },
        proof_of_id: { type: String }
    },

    score: {
        transunion: [
            {
                date: { type: Date },
                creditscore: {
                    type: String
                }
            }
        ],
        experian: [
            {
                date: { type: Date },
                creditscore: { type: String }
            }
        ],
        equifax: [{
            date: { type: Date },
            creditscore: { type: String }
        }]
    },

    payment: [{
        subscription_id: { type: String },
        payment_id: { type: String },
        signature: { type: String },
        endDate: { type: String },
        startDate: { type: String },
        status: {
            type: Boolean,
            default: false
        }
    }]








}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)
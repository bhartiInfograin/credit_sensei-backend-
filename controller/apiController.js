const querystring = require('querystring');
const axios = require('axios');
const bcrypt = require("bcrypt");
const userModel = require('../modal/userModal')
const multer = require('multer');
const sgMail = require('@sendgrid/mail');
const Razorpay = require("razorpay")
const crypto = require("crypto")


sgMail.setApiKey("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")

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}



exports.login = async (req, res) => {
    const j_username = req.body.j_username;
    const j_password = req.body.j_password;

    if (j_username == "" || j_username == undefined || j_username == null) {
        return res.json({ statusCode: 401, statusMsg: "username required" })
    }

    if (j_password == "" || j_password == undefined || j_password == null) {
        return res.json({ statusCode: 402, statusMsg: "password required" })
    }

    const article = {
        "j_username": j_username,
        "j_password": j_password,
        "loginType": "PARTNER_API"
    }
    let response = null;
    try {

        response = await axios({
            method: 'post',
            url: 'https://www.smartcredit.com/external-login',
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw==',
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify(article)
        });

        console.log("response", response)
        if (response.data.success == true) {
            const header = response.headers
            const cookiedata = header["set-cookie"]
            const cookiedata_jsonId = cookiedata[0];
            const cookiedata_trackingToken = cookiedata[2];
            const cookiedata_awsId = cookiedata[5];
            var jsonId = cookiedata_jsonId.split(";")[0].split("=")[1]
            var trackingToken = cookiedata_trackingToken.split(";")[0].split("=")[1]
            var awsId = cookiedata_awsId.split(";")[0].split("=")[1]
            const hashedPassword = await hashPassword(j_password)
            const user = await userModel.findOne({ email: j_username });

            if (!user) {
                let response = new userModel({
                    email: j_username,
                    password: hashedPassword,
                    trackingToken: trackingToken

                })
                response.save()
            } else {
                await userModel.findByIdAndUpdate(user._id, { trackingToken: trackingToken })
            }

            try {
                const report = await axios({
                    method: 'GET',
                    url: 'https://www.smartcredit.com/member/credit-report/3b/simple.htm?format=json',
                    headers: {
                        'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw==',
                        "accept": "application/x-www-form-urlencoded",
                        "Cookie": `TRACKING=${trackingToken};AWSELB=${awsId}; JSESSIONID=${jsonId}`
                    }
                },
                );

                if (report) {
                    var data1 = report.data
                    return res.json({ "data": data1, "trackingToken": trackingToken })
                } else {
                    return res.json({ statusCode: 500, statusMsg: "oop! somthing went wrong" })
                }

            } catch (error) {
                console.log(error)
            }
        }
    } catch (ex) {
        response = null;
        console.log(ex)
        return res.json({ statusMsg: ex.message })
    }
}


exports.start = async (req, res) => {

    try {
        response = await axios({
            method: 'GET',
            // url: 'https://www.smartcredit.com/api/signup/start?clientKey=cf2bc25b-5eaa-407e-9783-ae6498db4eb4',
            url: 'https://stage-sc.consumerdirect.com/api/signup/start?clientKey=cf2bc25b-5eaa-407e-9783-ae6498db4eb4',
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw=='
            },
        });

        if (response) {
            return res.json(response.data)
        }


    } catch (ex) {
        return res.json(ex)
    }

}

exports.create = async (req, res) => {

    const article = {
        clientKey: req.body.clientKey,
        trackingToken: req.body.trackingToken,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        sponsorCodeString: req.body.sponsorCodeString
    }


    try {

        let response = await axios({
            method: "POST",
            // url: 'https://www.smartcredit.com/api/signup/customer/create',
            url: 'https://stage-sc.consumerdirect.com/api/signup/customer/create',
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw==',
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify(article)
        });

        return res.json(response.data)

    } catch (error) {

        return res.json(error.response.data)
    }

}

exports.identity = async (req, res) => {

    const article = {
        clientKey: req.body.clientKey,
        trackingToken: req.body.trackingToken,
        customerToken: req.body.customerToken,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        homePhone: req.body.phoneNumber,
        "identity.ssn": req.body.ssn,
        "identity.ssnPartial": req.body.partialssn,
        "identity.birthDate": req.body.birthDate,
        "homeAddress.state": req.body.state,
        "homeAddress.city": req.body.city,
        "homeAddress.street": req.body.street,
        "homeAddress.zip": req.body.zip,
    }

    console.log("bharti", article);

    try {

        console.log("sagar", article);
        let response = await axios({
            method: 'post',
            // url: 'https://www.smartcredit.com/api/signup/customer/update/identity',
            url: 'https://stage-sc.consumerdirect.com/api/signup/customer/update/identity',
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw==',
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify(article)
        });

        console.log("response.data.success", response.data)
        return res.json(response.data)


    } catch (error) {
        console.log("erro", error.response.data)
        return res.json(error.response.data)
    }
}

exports.id_verification = async (req, res) => {

    const trackingToken = req.query.trackingToken
    const customerToken = req.query.customerToken
    const clientKey = "cf2bc25b-5eaa-407e-9783-ae6498db4eb4"

    console.log("trackingToken", trackingToken)
    console.log("customerToken", customerToken)
    console.log("clientKey", clientKey)


    try {
        response = await axios({
            method: 'GET',
            url: `https://stage-sc.consumerdirect.com/api/signup/id-verification?clientKey=${clientKey}&trackingToken=${trackingToken}&customerToken=${customerToken}`,
            // url: `https://www.smartcredit.com/api/signup/id-verification?clientKey=${clientKey}&trackingToken=${trackingToken}&customerToken=${customerToken}`,

        });

        if (response) {
            return res.json(response.data)
        }

    } catch (error) {
        return res.json(error.response.data)
    }

}




exports.ans_verification = async (req, res) => {

    const article = {
        clientKey: req.body.clientKey,
        customerToken: req.body.customerToken,
        trackingToken: req.body.trackingToken,
        "idVerificationCriteria.referenceNumber": req.body.referenceNumber,
        "idVerificationCriteria.answer1": req.body.answer1,
        "idVerificationCriteria.answer2": req.body.answer2,
        "idVerificationCriteria.answer3": req.body.answer3,
    }

    console.log("article", article)


    try {
        let response = await axios({
            method: 'post',
            // url: 'https://www.smartcredit.com/api/signup/id-verification',
            url: 'https://stage-sc.consumerdirect.com/api/signup/id-verification',
            data: article
        });

        console.log("response.data.success", response.data)
        return res.json(response.data)
    } catch (error) {
        console.log("erro", error.response.data)
        return res.json(error.response.data)
    }

}

exports.validate_creditCard = async (req, res) => {

    const clientKey = req.query.clientKey;
    const trackingToken = req.query.trackingToken;
    const cardNumber = req.query.cardNumber;

    console.log("clientKey", clientKey)
    console.log("trackingToken", trackingToken)
    console.log("cardNumber", cardNumber)

    if (clientKey == "" || clientKey == null || clientKey == undefined) {
        return res.json({ statusCode: 401, statusMsg: "ClientKey required" })
    }

    if (trackingToken == "" || trackingToken == null || trackingToken == undefined) {
        return res.json({ statusCode: 401, statusMsg: "TrackingToken required" })
    }

    if (cardNumber == "" || cardNumber == null || cardNumber == undefined) {
        return res.json({ statusCode: 406, statusMsg: "Cardnumber required" })
    }


    try {
        response = await axios({
            method: 'GET',
            url: `https://www.smartcredit.com/api/signup/validate/credit-card-number?clientKey=${clientKey}&number=${cardNumber}&trackingToken=${trackingToken}`,
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw=='
            },
        });

        if (response) {
            return res.json(response.data)
        }

    } catch (error) {
        return res.json(error.response.data)
    }




}

exports.update_creditCard = async (req, res) => {

    const clientKey = req.body.clientKey;
    const trackingToken = req.body.trackingToken;
    const customerToken = req.body.customerToken;
    const cardName = req.body.cardName;
    const cardToken = req.body.cardToken;
    const cardexp_month = req.body.cardexp_month;
    const cardexp_year = req.body.cardexp_year;
    const cardCvv = req.body.cardCvv;
    const planType = req.body.planType;
    const confirmedTerms = req.body.confirmedTerms;
    const cardAddress = req.body.cardAddress;
    const browserIP = req.body.browserIP;


    const article = {
        clientKey: clientKey,
        trackingToken: trackingToken,
        customerToken: customerToken,
        "creditCard.name": cardName,
        "creditCard.token": cardToken,
        "creditCard.expirationMonth": cardexp_month,
        "creditCard.expirationYear": cardexp_year,
        "creditCard.cvv": cardCvv,
        "planType": planType,
        "isConfirmedTerms": confirmedTerms,
        "creditCard.address": cardAddress,
        "confirmTermsBrowserIpAddress": browserIP
    }

    console.log("article", article);

    try {

        const response = await axios({
            method: 'GET',
            url: " https://www.smartcredit.com/api/signup/customer/update/credit-card",
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw=='
            },
            data: querystring.stringify(article)
        })

        if (response) {
            console.log(response)
            return res.json(response.data)
        }

    } catch (error) {
        console.log(error)
        return res.json(error.response.data)
    }


}

exports.complete = async (req, res) => {

    var article = {
        clientKey: req.body.clientKey,
        trackingToken: req.body.trackingToken,
        customerToken: req.body.customerToken,
        confirmTermsBrowserIpAddress: req.body.ipAddress,
        isConfirmedTerms: req.body.confirmTerm
    }

    console.log("article", article)

    try {

        var response = await axios({
            method: "POST",
            url: "https://www.smartcredit.com/api/signup/complete",
            data: article
        })

        if (response) {
            console.log(response)
            return res.json(response.data)
        }
    } catch (error) {

        console.log(error)
        return res.json(error.response.data)
    }
}

exports.security_questions = async (req, res) => {
    const clientKey = req.query.clientKey;
    const trackingToken = req.query.trackingToken

    console.log("clientKey", clientKey)
    console.log("trackingToken", trackingToken)

    try {

        var response = await axios({
            method: "GET",
            url: `https://www.smartcredit.com/api/signup/security-questions?clientKey=${clientKey}&trackingToken=${trackingToken}`,
            headers: {
                'Authorization': 'Basic Y3JlZGl0c2Vuc2VpOnRlbWlkZW50aW91cw=='
            },
        })

        if (response) {
            console.log(response)
            return res.json(response.data)
        }
    } catch (error) {
        console.log(error)
        return res.json(error.response.data)
    }
}


exports.sendMail = async (req, res) => {


    var pdf = req.body.text

    if (pdf == null || pdf == "" || pdf == undefined) {
        return res.json({ statusCode: 400, statusMsg: "pdf required" })
    }

    const msg = {
        to: 'bharti.infograins@gmail.com', // Change to your recipient
        from: 'nadeem.infograins@gmail.com', // Change to your verified sender
        subject: 'dispute letter',
        text: 'and easy to do anywhere, even with Node.js',
        attachments: [{
            content: pdf,
            filename: "disputelter.pdf",
            type: 'application/pdf',
            disposition: "attachment",
            contentId: "mytext"
        }]
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })


}



exports.transunion_dispute_letter = async (req, res) => {

    const {
        trackingToken: trackingToken,
        account_pdf: account_pdf,
        inquiry_pdf: inquiry_pdf,
        transunion_create_date: transunion_create_date,
    } = req.body

    // const transunionPdf = { "data": transunion_pdf }
    const transunionCreateDate = { "data": transunion_create_date }

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    // if (transunion_pdf == null || transunion_pdf == "" || transunion_pdf == undefined) {
    //     return res.json({ statusCode: 400, statusMsg: "transunion_pdf required" })
    // }

    if (transunion_create_date == null || transunion_create_date == "" || transunion_create_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "transunion_create_date required" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {
        // const _sentDate = user.transunion.sent_date;
        // if (_sentDate.length > 0) {
        //     const d = _sentDate.pop();
        //     const sentDate = new Date(d.data);
        //     var nextmonth = new Date(new Date(sentDate).setDate(new Date(sentDate).getDate() + 40));
        //     var currentDate = new Date();

        //     if (currentDate < nextmonth) {
        //         return res.json({ statusCode: 400, statusMsg: "Dispute already sent" })

        //     } else {

        //         userModel.updateOne({ _id: user._id }, { $addToSet: { "transunion.create_date": transunionCreateDate, "transunion.pdf": transunionPdf } })
        //             .then((result) => {
        //                 return res.json({ statusCode: 200, statusMsg: "Transunion dispute letter created successfully!" })
        //             }).catch((err) => {
        //                 return res.send(err)
        //             })
        //     }
        // }

        var query = {}

        if (account_pdf) {
            query = { $set: { "transunion.create_date": transunionCreateDate, "transunion.pdf.account_pdf": account_pdf } }
        }
        if (inquiry_pdf) {
            query = { $set: { "transunion.create_date": transunionCreateDate, "transunion.pdf.inquiry_pdf": inquiry_pdf } }
        }


        userModel.updateOne({ _id: user.id }, query).then((result) => {
            return res.json({ statusCode: 200, statusMsg: "Transunion dispute letter created successfully!" })
        })

        // if(account_pdf){
        //     userModel.updateOne({ _id: user._id }, { $set: {"transunion.create_date": transunionCreateDate,"transunion.pdf": {"account_pdf":account_pdf} } })
        //     .then((result) => {
        //         return res.json({ statusCode: 200, statusMsg: "Transunion dispute letter created successfully!" })
        //     }).catch((err) => {
        //         console.log("err",err)
        //         return res.send(err)
        //     })
        // }
        // if(inquiry_pdf){
        //     userModel.updateOne({ _id: user._id }, { $set: {"transunion.create_date": transunionCreateDate,"transunion.pdf": {"inquiry_pdf":inquiry_pdf} } })
        //     .then((result) => {
        //         return res.json({ statusCode: 200, statusMsg: "Transunion dispute letter created successfully!" })
        //     }).catch((err) => {
        //         console.log("err",err)
        //         return res.send(err)
        //     })
        // }

    }
    if (!user) {
        return res.json({ statusCode: 400, statusMsg: "Invalid Tracking Token" })
    }

}



exports.experian_dispute_letter = async (req, res) => {

    const {
        trackingToken: trackingToken,
        account_pdf: account_pdf,
        inquiry_pdf: inquiry_pdf,
        experian_create_date: experian_create_date,
    } = req.body

    // const experianPdf = { "data": experian_pdf }
    const experianCreateDate = { "data": experian_create_date }



    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    // if (experian_pdf == null || experian_pdf == "" || experian_pdf == undefined) {
    //     return res.json({ statusCode: 400, statusMsg: "experian_pdf required" })
    // }

    if (experian_create_date == null || experian_create_date == "" || experian_create_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "experian_create_date required" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {

        var query = {}

        if (account_pdf) {
            query = { $set: { "experian.create_date": experianCreateDate, "experian.pdf.account_pdf": account_pdf } }
        }
        if (inquiry_pdf) {
            query = { $set: { "experian.create_date": experianCreateDate, "experian.pdf.inquiry_pdf": inquiry_pdf } }
        }


        userModel.updateOne({ _id: user.id }, query).then((result) => {
            return res.json({ statusCode: 200, statusMsg: "Experian dispute letter created successfully!" })
        })
    }
    if (!user) {
        return res.json({ statusCode: 400, statusMsg: "Invalid Tracking Token" })
    }
}

exports.equifax_dispute_letter = async (req, res) => {

    const {
        trackingToken: trackingToken,
        account_pdf: account_pdf,
        inquiry_pdf: inquiry_pdf,
        // equifax_pdf: equifax_pdf,
        equifax_create_date: equifax_create_date,
    } = req.body


    // const experianPdf = { "data": equifax_pdf }
    const equifaxCreateDate = { "data": equifax_create_date }


    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    // if (equifax_pdf == null || equifax_pdf == "" || equifax_pdf == undefined) {
    //     return res.json({ statusCode: 400, statusMsg: "equifax_pdf required" })
    // }

    if (equifax_create_date == null || equifax_create_date == "" || equifax_create_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "equifax_create_date required" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })
    if (user) {


        var query = {}

        if (account_pdf) {
            query = { $set: { "equifax.create_date": equifaxCreateDate, "equifax.pdf.account_pdf": account_pdf } }
        }
        if (inquiry_pdf) {
            query = { $set: { "equifax.create_date": equifaxCreateDate, "equifax.pdf.inquiry_pdf": inquiry_pdf } }
        }


        userModel.updateOne({ _id: user.id }, query).then((result) => {
            return res.json({ statusCode: 200, statusMsg: "Equifax dispute letter created successfully!" })
        })

        // const _sentDate = user.equifax.sent_date;
        // if (_sentDate.length > 0) {
        //     return res.json({ statusCode: 400, statusMsg: "Dispute letter already sent" })
        // }

        // userModel.updateOne({ _id: user._id }, { $set: { "equifax.create_date": experianCreateDate, "equifax.pdf": experianPdf } })
        //     .then((result) => {
        //         return res.json({ statusCode: 200, statusMsg: "Equifax dispute letter created successfully!" })
        //     }).catch((err) => {
        //         return res.send(err)
        //     })
    }
    if (!user) {
        return res.json({ statusCode: 400, statusMsg: "Invalid Tracking Token" })
    }

}












exports.transunion_sent_letter = async (req, res) => {
    const {
        trackingToken,
        transunion_sent_date,
    } = req.body

    const sentDate = { "data": transunion_sent_date }

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    if (transunion_sent_date == null || transunion_sent_date == "" || transunion_sent_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "transunion_sent_date required" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })


    if (user) {

        var account_pdf = user.transunion.pdf.account_pdf;
        var inquiry_pdf = user.transunion.pdf.inquiry_pdf;


        // if (account_pdf && inquiry_pdf == null || account_pdf && inquiry_pdf == "" || account_pdf && inquiry_pdf == undefined) {
        //     return res.json({ statusCode: 400, statusMsg: "Create dispute letter" })
        // }

        if(account_pdf){
            var _account_pdf = account_pdf.split(',')[1];
        }
    
        if(inquiry_pdf){
            var _inquiry_pdf = inquiry_pdf.split(',')[1];
        }


        var user_email = user.email;


        var attachment = []

        if (_account_pdf) {

            var accountObject = {
                content: _account_pdf,
                filename: "DisputeLetter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(accountObject)
        }

        if (_inquiry_pdf) {
            var inquiryObject = {
                content: _inquiry_pdf,
                filename: "Inquiry_Dispute_Letter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(inquiryObject)
        }


        if (_account_pdf && _inquiry_pdf) {
            attachment = [
                {
                    content: _account_pdf,
                    filename: "DisputeLetter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                },
                {
                    content: _inquiry_pdf,
                    filename: "Inquiry_Dispute_Letter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                }
            ]
        }


        const msg = {
            to: user_email,
            // to: "bharti.infograins@gmail.com",
            from: 'nadeem.infograins@gmail.com',
            subject: 'dispute letter',
            text: 'and easy to do anywhere, even with Node.js',
            attachments:attachment
            // attachments: [
            //     {
            //         content: _account_pdf,
            //         filename: "DisputeLetter.pdf",
            //         type: 'application/pdf',
            //         disposition: "attachment"
            //     },
            //     {
            //         content: _inquiry_pdf,
            //         filename: "Inquiry_Dispute_Letter.pdf",
            //         type: 'application/pdf',
            //         disposition: "attachment"
            //     },
            // ]
        }
        sgMail.send(msg, async function (err, data) {
            if (err) {
                return res.json({ statusCode: 400, statusMsg: err })
            }
            if (data) {
                await userModel.updateOne({ _id: user._id }, { $set: { "transunion.sent_date": sentDate } })
                return res.json({ statusCode: 200, statusMsg: "Transunion Dispte Letter sent" })
            }
        })

    }
    if (!user) {
        return res.status(400).json("Invalid Tracking Token")

    }
}

exports.experian_sent_letter = async (req, res) => {
    const {
        trackingToken,
        experian_sent_date,
    } = req.body

    const sentDate = { "data": experian_sent_date }

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    if (experian_sent_date == null || experian_sent_date == "" || experian_sent_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "experian_sent_date required" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {

        var account_pdf = user.experian.pdf.account_pdf;
        var inquiry_pdf = user.experian.pdf.inquiry_pdf;


        // if (account_pdf && inquiry_pdf == null || account_pdf && inquiry_pdf == "" || account_pdf && inquiry_pdf == undefined) {
        //     return res.json({ statusCode: 400, statusMsg: "Create dispute letter" })
        // }

        if(account_pdf){
            var _account_pdf = account_pdf.split(',')[1];
        }
    
        if(inquiry_pdf){
            var _inquiry_pdf = inquiry_pdf.split(',')[1];
        }

        var user_email = user.email;
        var attachment = []

        if (_account_pdf) {

            var accountObject = {
                content: _account_pdf,
                filename: "DisputeLetter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(accountObject)
        }

        if (_inquiry_pdf) {
            var inquiryObject = {
                content: _inquiry_pdf,
                filename: "Inquiry_Dispute_Letter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(inquiryObject)
        }


        if (_account_pdf && _inquiry_pdf) {
            attachment = [
                {
                    content: _account_pdf,
                    filename: "DisputeLetter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                },
                {
                    content: _inquiry_pdf,
                    filename: "Inquiry_Dispute_Letter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                }
            ]
        }



        const msg = {
            to: user_email,
            // to: "bharti.infograins@gmail.com",
            from: 'nadeem.infograins@gmail.com',
            subject: 'dispute letter',
            text: 'and easy to do anywhere, even with Node.js',
            attachments:attachment
            // attachments: [
            //     {
            //         content: _account_pdf,
            //         filename: "DisputeLetter.pdf",
            //         type: 'application/pdf',
            //         disposition: "attachment"
            //     },
            //     {
            //         content: _inquiry_pdf,
            //         filename: "Inquiry_Dispute_Letter.pdf",
            //         type: 'application/pdf',
            //         disposition: "attachment"
            //     },

            // ]
        }
        sgMail.send(msg, async function (err, data) {
            if (err) {
                return res.json({ statusCode: 400, statusMsg: err })
            }
            if (data) {
                await userModel.updateOne({ _id: user._id }, { $set: { "experian.sent_date": sentDate } })
                return res.json({ statusCode: 200, statusMsg: "Experian Dispte Letter sent" })
            }
        })
    }

    if (!user) {
        return res.status(400).json("Invalid Tracking Token")
    }
}

exports.equifax_sent_letter = async (req, res) => {
    const {
        trackingToken,
        equifax_sent_date,
    } = req.body


    const sentDate = { "data": equifax_sent_date }

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    if (equifax_sent_date == null || equifax_sent_date == "" || equifax_sent_date == undefined) {
        return res.json({ statusCode: 400, statusMsg: "equifax sent date required" })
    }



    const user = await userModel.findOne({ trackingToken: trackingToken })
    if (user) {

        var account_pdf = user.equifax.pdf.account_pdf;
        var inquiry_pdf = user.equifax.pdf.inquiry_pdf;


        // if (account_pdf && inquiry_pdf == null || account_pdf && inquiry_pdf == "" || account_pdf && inquiry_pdf == undefined) {
        //     return res.json({ statusCode: 400, statusMsg: "Create dispute letter" })
        // }

        if(account_pdf){
            var _account_pdf = account_pdf.split(',')[1];
        }
    
        if(inquiry_pdf){
            var _inquiry_pdf = inquiry_pdf.split(',')[1];
        }

        var user_email = user.email;
        var attachment = []

        if (_account_pdf) {

            var accountObject = {
                content: _account_pdf,
                filename: "DisputeLetter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(accountObject)
        }

        if (_inquiry_pdf) {
            var inquiryObject = {
                content: _inquiry_pdf,
                filename: "Inquiry_Dispute_Letter.pdf",
                type: 'application/pdf',
                disposition: "attachment"
            }

            attachment.push(inquiryObject)
        }


        if (_account_pdf && _inquiry_pdf) {
            attachment = [
                {
                    content: _account_pdf,
                    filename: "DisputeLetter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                },
                {
                    content: _inquiry_pdf,
                    filename: "Inquiry_Dispute_Letter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                }
            ]
        }


        const msg = {
            to: user_email,
            // to: "bharti.infograins@gmail.com",
            from: 'nadeem.infograins@gmail.com',
            subject: 'dispute letter',
            text: 'and easy to do anywhere, even with Node.js',
            attachments: [
                {
                    content: _account_pdf,
                    filename: "EquifaxDisputeLetter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                },
                {
                    content: _inquiry_pdf,
                    filename: "EquifaxInquiry_Dispute_Letter.pdf",
                    type: 'application/pdf',
                    disposition: "attachment"
                },
            ]
        }
        sgMail.send(msg, async function (err, data) {
            if (err) {
                return res.json({ statusCode: 400, statusMsg: err })
            }
            if (data) {
                await userModel.updateOne({ _id: user._id }, { $set: { "equifax.sent_date": sentDate } })
                return res.json({ statusCode: 200, statusMsg: "Equifax Dispte Letter sent" })
            }
        })

    }

    if (!user) {
        return res.status(400).json("Invalid Tracking Token")
    }


}





exports.createDate = async (req, res) => {

    const trackingToken = req.body.trackingToken;
    const bureau = req.body.bureau

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    if (bureau == null || bureau == "" || bureau == undefined) {
        return res.json({ statusCode: 400, statusMsg: "Enter Bureau" })
    }

    const response = await userModel.findOne({ trackingToken: trackingToken })


    if (!response) {
        return res.status(400).json("Invalid Tracking Token")
    }

    if (response) {
        if (bureau == "Transuion") {
            const create_date = response.transunion.create_date.pop()
            if (!create_date) {
                return res.json({ statusCode: 400, statusMsg: "Dispute letter not created" })
            }
            if (create_date) {
                const _create_date = create_date.data
                return res.json({ statusCode: 200, statusMsg: _create_date })
            }
        }

        if (bureau == "Experian") {
            const create_date = response.experian.create_date.pop()
            if (!create_date) {
                return res.json({ statusCode: 400, statusMsg: "Dispute letter not created" })
            }
            if (create_date) {
                const _create_date = create_date.data
                return res.json({ statusCode: 200, statusMsg: _create_date })
            }
        }

        if (bureau == "Equifax") {
            const create_date = response.equifax.create_date.pop()
            if (!create_date) {
                return res.json({ statusCode: 400, statusMsg: "Dispute letter not created" })
            }
            if (create_date) {
                const _create_date = create_date.data
                return res.json({ statusCode: 200, statusMsg: _create_date })

            }
        }
    }

}

exports.sentDate = async (req, res) => {
    const trackingToken = req.body.trackingToken;
    const bureau = req.body.bureau

    if (trackingToken == null || trackingToken == "" || trackingToken == undefined) {
        return res.json({ statusCode: 400, statusMsg: "trackingToken required" })
    }

    if (bureau == null || bureau == "" || bureau == undefined) {
        return res.json({ statusCode: 400, statusMsg: "Enter Bureau" })
    }


    const response = await userModel.findOne({ trackingToken: trackingToken })

    if (!response) {
        return res.status(400).json("Invalid Tracking Token")
    } else {

        if (bureau == "Transuion") {
            const sent_date = response.transunion.sent_date.pop()

            if (!sent_date) {
                return res.json({ statusCode: 400, statusMsg: "Letter not sent" })
            }
            if (sent_date) {
                const _sent_date = sent_date.data
                return res.json({ statusCode: 200, statusMsg: _sent_date })
            }

        }

        if (bureau == "Experian") {
            const sent_date = response.experian.sent_date.pop()
            if (!sent_date) {
                return res.json({ statusCode: 400, statusMsg: "Letter not sent" })
            }
            if (sent_date) {
                const _sent_date = sent_date.data
                return res.json({ statusCode: 200, statusMsg: _sent_date })
            }
        }

        if (bureau == "Equifax") {
            const sent_date = response.equifax.sent_date.pop()
            if (!sent_date) {
                return res.json({ statusCode: 400, statusMsg: "Letter not sent" })
            }
            if (sent_date) {
                const _sent_date = sent_date.data
                return res.json({ statusCode: 200, statusMsg: _sent_date })
            }
        }

    }




}








const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./upload");
    },
    filename: (req, file, cb) => {
        var timestamp = new Date().getTime();
        var unixTimeStamp = Math.floor(timestamp / 1000);
        var extensionsGet = file.originalname;
        extensionsGet = extensionsGet.split('.');
        extensionsGet = extensionsGet[1];


        console.log("extensionsGet", extensionsGet)

        if (extensionsGet === "png" || extensionsGet === "jpg" || extensionsGet === "jpeg") {
            console.log("extensionsGet", "1");
            if (file) {
                console.log("extensionsGet", "2", file);
                cb(null, unixTimeStamp + file.originalname)
            }
        } else {
            console.log("extensionsGet", "3");
            cb({
                statusCode: 403,
                statusMsj: file.originalname + " Image Not saported. Upload valid image"
            });
        }

    }
});

const upload = multer({ storage: storage }).single('fileName');



exports.upload_doc = async (req, res) => {
    upload(req, res, err => {

        if (err) {
            if (err.statusCode == 403) {
                return res.json({ statusCode: 403, statusMsg: "Image Not saported.Upload valid image" })
            }
        } else {

            const {
                doc_type,
                trackingToken,
            } = req.body

            if (req.file == undefined || req.file == null || req.file == "") {
                return res.json({ statusCode: 403, statusMsj: "pleas select image" })
            }
            if (doc_type == undefined || doc_type == null || doc_type == "") {
                return res.json({ statusCode: 403, statusMsj: "please select doc type" })
            }
            if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
                return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
            }

            userModel.findOne({ trackingToken: trackingToken })
                .then(data => {
                    if (!data) {
                        return res.status(400).json("Invalid Tracking Token")
                    }

                    if (data) {
                        if (doc_type == "addressproof") {
                            var BASE_URL = "https://www.mycreditsensei.com:5000/upload/";
                            var url = BASE_URL + req.file.filename;
                            var addresssUrl = url.replace(/ +/g, "%20");

                            userModel.updateOne({ _id: data._id }, { $set: { 'document.proof_of_address': addresssUrl } })
                                .then(data => {
                                    console.log("dataaaa", data)
                                    return res.json({ statusCode: 200, statusMsj: "document uploaded successfully" })
                                }).catch(err => {
                                    console.log("4545232rere", err)
                                    return res.json({ statusCode: 400, statusMsj: err })
                                })
                        }

                        if (doc_type == "idproof") {

                            var BASE_URL = "https://www.mycreditsensei.com:5000/upload/";
                            var url = BASE_URL + req.file.filename;
                            var idUrl = url.replace(/ +/g, "%20");

                            userModel.updateOne({ _id: data._id }, { $set: { 'document.proof_of_id': idUrl } })
                                .then(data => {
                                    return res.json({ statusCode: 200, statusMsj: "document uploaded successfully" })
                                }).catch(err => {
                                    console.log("errrdfdf", err)
                                    return res.json({ statusCode: 400, statusMsj: err })
                                })
                        }

                    }

                }).catch(err => {
                    console.log("errrrrr", err)
                    return res.json({ statusCode: 400, statusMsj: err })
                })
        }
    })
}

exports.delete_doc = async (req, res) => {

    const {
        doc_type,
        trackingToken,
    } = req.body


    if (doc_type == undefined || doc_type == null || doc_type == "") {
        return res.json({ statusCode: 403, statusMsj: "please select doc type" })
    }
    if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
        return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
    }


    const result = await userModel.findOne({ trackingToken: trackingToken })

    if (result) {
        if (doc_type == "addressproof") {
            const user = await userModel.updateOne({ trackingToken: trackingToken }, { $unset: { "document.proof_of_address": 1 } });
            if (user) {
                return res.json({ statusCode: 200, statusMsj: "Proof of address deleted successfully" })
            }
        }

        if (doc_type == "idproof") {
            const user = await userModel.updateOne({ trackingToken: trackingToken }, { $unset: { "document.proof_of_id": 1 } });
            if (user) {
                return res.json({ statusCode: 200, statusMsj: "Proof of id deleted successfully" })
            }
        }
    } else {
        return res.json({ statusCode: 400, statusMsg: "Bad request" })
    }






}

exports.get_doc = async (req, res) => {

    const {
        doc_type,
        trackingToken,
    } = req.body


    if (doc_type == undefined || doc_type == null || doc_type == "") {
        return res.json({ statusCode: 403, statusMsj: "please select doc type" })
    }
    if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
        return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {
        const data = user.document
        const idProof = data.proof_of_id;
        const addressProof = data.proof_of_address



        if (doc_type == "idproof") {
            if (idProof) {
                return res.json({ statusCode: 200, statusMsg: idProof })
            } else {
                return res.json({ statusCode: 400, statusMsg: "please upload your id proof" })
            }
        }

        if (doc_type == "addressproof") {
            if (addressProof) {
                return res.json({ statusCode: 200, statusMsg: addressProof })
            } else {
                return res.json({ statusCode: 400, statusMsg: "please upload your address proof" })
            }

        }

    } else {
        return res.json({ statusCode: 400, statusMsg: "Bad request" })
    }


}


exports.all_doc = async (req, res) => {

    const trackingToken = req.query.trackingToken

    if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
        return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {
        const doc = user.document;

        if (!doc.proof_of_address) {
            return res.json({ statusCode: 403, statusMsg: "Please Upload your address proof" })
        }

        if (!doc.proof_of_id) {
            return res.json({ statusCode: 403, statusMsg: "Please Upload your Id proof" })
        }
        if (doc) {
            return res.json({ statusCode: 200, statusMsg: doc })
        }

    } else {
        return res.json({ statusCode: 400, statusMsg: "Invalid tracking token" })
    }

}



exports.credit_score = async (req, res) => {
    const {
        trackingToken,
        transunion_credit_score,
        experian_credit_score,
        equifax_credit_score
    } = req.body


    if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
        return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken });

    if (user) {

        if (user.score.transunion.length > 0 && user.score.experian.length > 0 && user.score.equifax.length > 0) {
            const transunion_score = user.score.transunion;
            const experian_score = user.score.experian;
            const equifax_score = user.score.equifax;
            var transunion_last_updated_score = transunion_score[transunion_score.length - 1]
            var experian_last_updated_score = experian_score[experian_score.length - 1]
            var equifax_last_updated_score = equifax_score[equifax_score.length - 1]

            if ((transunion_last_updated_score.creditscore > transunion_credit_score && transunion_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString()) ||
                (transunion_last_updated_score.creditscore < transunion_credit_score && transunion_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString()) ||
                (experian_last_updated_score.creditscore > experian_credit_score && experian_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString()) ||
                (experian_last_updated_score.creditscore < experian_credit_score && experian_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString()) ||
                (equifax_last_updated_score.creditscore > equifax_credit_score && equifax_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString()) ||
                (equifax_last_updated_score < equifax_credit_score && equifax_last_updated_score.date.toLocaleDateString() < new Date().toLocaleDateString())
            ) {
                userModel.updateOne({ _id: user._id }, {
                    $addToSet: {
                        'score.transunion': { 'date': new Date().toLocaleDateString(), 'creditscore': transunion_credit_score },
                        'score.experian': { 'date': new Date().toLocaleDateString(), 'creditscore': experian_credit_score },
                        'score.equifax': { 'date': new Date().toLocaleDateString(), 'creditscore': equifax_credit_score },
                    }
                })
                    .then(data => {
                        console.log("data", data)
                        return res.json({ statusCode: 200, statusMsj: "score uploaded successfully" })
                    }).catch(err => {
                        console.log("err", err)
                        return res.json({ statusCode: 400, statusMsj: err })
                    })
            } else {
                return res.json({ statusCode: 400, statusMsg: "score not updated" })
            }

        } else {

            userModel.updateOne({ _id: user._id }, {
                $set: {
                    'score.transunion': { 'date': new Date().toLocaleDateString(), 'creditscore': transunion_credit_score },
                    'score.experian': { 'date': new Date().toLocaleDateString(), 'creditscore': experian_credit_score },
                    'score.equifax': { 'date': new Date().toLocaleDateString(), 'creditscore': equifax_credit_score },
                }
            })
                .then(data => {
                    return res.json({ statusCode: 200, statusMsj: "score uploaded successfully" })
                }).catch(err => {
                    return res.json({ statusCode: 400, statusMsj: err })
                })
        }

    } else {
        return res.json({ statusCode: 400, statusMsg: "Invalid tracking token" })
    }



}


exports.getCreditScore = async (req, res) => {

    const trackingToken = req.query.trackingToken

    if (trackingToken == undefined || trackingToken == null || trackingToken == "") {
        return res.json({ statusCode: 403, statusMsj: "Enter valid tracking Token" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })
    if (user) {
        const score = user.score
        if (user.score.transunion.length != 0 && user.score.experian.length != 0 && user.score.equifax.length != 0) {
            return res.json({ statusCode: 200, statusMsj: score })
        } else {
            return res.json({ statusCode: 400, statusMsg: "Please update score" })
        }



    } else {
        return res.json({ statusCode: 400, statusMsg: "Invalid tracking token" })
    }

}


exports.plan = async (req, res) => {
    try {

        const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET
        });

        const params = {
            "period": "monthly",
            "interval": 1,
            "item": {
                "name": "CreditSenseiPlan-monthly",
                "amount": 39000,
                "currency": "INR",
                "description": "Description for the test plan"
            },
        }
        instance.plans.create(params, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ msg: "Somthing went wrong" })
            } else {
                res.status(200).json({ data: order })
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" })
    }
}





exports.subcription = async (req, res) => {

    var nextmonth = new Date(new Date().setDate(new Date().getDate() + 30))
    var timestamp = nextmonth.getTime();
    var unixTimeStamp = Math.floor(timestamp / 1000);

    try {
        const instance = new Razorpay({
            key_id: "rzp_test_FRwpmu0LJEnAkl",
            key_secret: "FHjREQDnW37Hh6jM9MDMOTvU"
        });

        const params = {
            plan_id: "plan_JlEyM3N6BPnzhq",
            customer_notify: 1,
            quantity: 1,
            total_count: 1,
            start_at: unixTimeStamp,
            addons: [
                {
                    item: {
                        name: "Delivery charges",
                        amount: 3900,
                        currency: "INR"
                    }
                }
            ]

        }

        instance.subscriptions.create(params, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ msg: "Somthing went wrong" })
            } else {
                res.status(200).json({ data: order })
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" })
    }
}



exports.verify = async (req, res) => {
    try {
        const {
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature,
            trackingToken,
            endDate,
            startDate
        } = req.body;

        const sign = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectdSign = crypto
            .createHmac("sha256", "FHjREQDnW37Hh6jM9MDMOTvU")
            .update(sign.toString())
            .digest("hex");
        if (razorpay_signature === expectdSign) {
            userModel.findOneAndUpdate({ trackingToken: trackingToken }, {
                $addToSet: {
                    'payment': {
                        'subscription_id': razorpay_subscription_id,
                        'payment_id': razorpay_payment_id,
                        'signature': razorpay_signature,
                        'endDate': endDate,
                        'startDate': startDate,
                        'status': "true"
                    },
                }
            })
                .then(data => {
                    return res.json({ statusCode: 200, statusMsj: "Payment verified successfully" })
                }).catch(err => {
                    return res.json({ statusCode: 400, statusMsj: err })
                })
        } else {
            return res.json({ statusCode: 400, statusMsj: "Invalid signature sent" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Internal server error" })
    }
}


exports.getDueDate = async (req, res) => {

    const trackingToken = req.query.trackingToken

    if (trackingToken == undefined || trackingToken == "" || trackingToken == null) {
        return res.json({ statusCode: 403, statusMsg: "Enter valid tracking Token" })
    }

    const user = await userModel.findOne({ trackingToken: trackingToken })

    if (user) {

        const _Date = user.payment
        if (_Date.length != 0) {
            const all_dates = _Date[_Date.length - 1]
            const _allDates = {
                "endDate": all_dates.endDate,
                "startDate": all_dates.startDate,
            }

            return res.json({ statusCode: 200, statusMsg: _allDates })
        } else {
            return res.json({ statusCode: 400, statusMsg: "Invalid subcription" })
        }

    } else {
        return res.json({ statusCode: 400, statusMsg: "Invalid tracking token" })
    }
}

exports.contactus = async (req, res) => {
    const {
        name,
        email,
        number,
        message
    } = req.body

    if (name == "" || name == undefined || name == null) {
        return res.json({ statusCode: 400, statusMsg: "name required" })
    }
    if (email == "" || email == undefined || email == null) {
        return res.json({ statusCode: 400, statusMsg: "email required" })
    }
    if (number == "" || number == undefined || number == null) {
        return res.json({ statusCode: 400, statusMsg: "number required" })
    }
    if (message == "" || message == undefined || message == null) {
        return res.json({ statusCode: 400, statusMsg: "message required" })
    }

    const msg = {
        to: 'bharti.infograins@gmail.com',
        from: 'nadeem.infograins@gmail.com',
        subject: 'Inquiry',
        text: `
              Name:${name}
              Email:${email}
              Phone Number : ${number}
              Message:${message} `
    }
    sgMail.send(msg, async function (err, data) {
        if (err) {
            return res.json({ statusCode: 400, statusMsg: err })
        }
        if (data) {
            return res.json({ statusCode: 200, statusMsg: "Email sent successfully" })
        }
    })




}









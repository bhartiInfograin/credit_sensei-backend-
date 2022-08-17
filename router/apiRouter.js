const express = require('express');
const router = express.Router();


const {
    login,
     start,
     create,
     identity,
     id_verification,
     ans_verification,
     validate_creditCard,
     update_creditCard,
     complete,
     security_questions,
     sendMail,
     transunion_dispute_letter,
     experian_dispute_letter,
     equifax_dispute_letter,
     transunion_sent_letter,
     experian_sent_letter,
     equifax_sent_letter,
     createDate,
     sentDate,
     upload_doc,
     delete_doc,
     get_doc,
     all_doc,
     credit_score,
     getCreditScore,
     plan,
     subcription,
     verify,
     getDueDate,
     contactus,
   
     checkout,
     subscriptions_list,
     del_subscriptions
     
}= require("../controller/apiController")

router.post("/login",login);
router.get("/start",start);
router.post("/create",create);
router.post("/identity",identity);
router.get("/id_verification",id_verification);
router.post("/ans_verification",ans_verification);
router.get("/validate_creditcard",validate_creditCard);
router.post("/update_creditcard",update_creditCard);
router.post("/complete",complete);
router.get("/security_questions",security_questions);
router.post("/sendMail",sendMail);
router.post("/transunion_dispute_letter",transunion_dispute_letter);
router.post("/experian_dispute_letter",experian_dispute_letter);
router.post("/equifax_dispute_letter",equifax_dispute_letter);
router.post("/transunion_sent_letter",transunion_sent_letter);
router.post("/experian_sent_letter",experian_sent_letter);
router.post("/equifax_sent_letter",equifax_sent_letter);
router.post("/createDate",createDate);
router.post("/sentDate",sentDate);
router.post("/upload_doc",upload_doc);
router.post("/delete_doc",delete_doc);
router.post("/get_doc",get_doc);
router.get("/all_doc",all_doc);
router.post("/credit_score",credit_score);
router.get("/getCreditScore",getCreditScore);
router.post("/plan",plan);
router.post("/subcription",subcription);
router.post("/verify",verify);
router.get("/getDueDate",getDueDate);
router.post("/contactus",contactus);

router.post("/checkout",checkout);
router.post("/subscriptions_list",subscriptions_list);
router.post("/del_subscriptions",del_subscriptions);



module.exports = router;

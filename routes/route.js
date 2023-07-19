const dburl = 'mongodb://127.0.0.1:27017/lpms';
const express = require("express");

const router = express.Router();

const session = require('express-session');
const MongoStore = require("connect-mongo");
const bodyParser = require('body-parser')


const {
    loginUser,
    createUser,
    logoutUser,
} = require("../controllers/user");

const {
    getSubject,
    getSubjectById,
    createSubject,
    deleteSubject,
} = require("../controllers/subject");

const {
    getChapter,
    createChapter, 
    deleteChapter,
} = require("../controllers/chapter.js");


const {
    getResource,
    createResource,
    deleteResource,
} = require("../controllers/resource");

const {
    getAssignment,
    createAssignment,
    deleteAssignment,
} = require("../controllers/assignment");

const {
    listWeek,
    createWeek,
    singleWeek,
    addTopicToWeek,
    deleteWeek,
    deleteAllWeeks,
    viewAllWeeks,
} = require('../controllers/week');

const {
    createTopic,
    removeWeek,
    deleteTopic,
} = require("../controllers/topic");

const requireLogin = async(req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/');
    }
    next();
}



const secret = 'thisshouldbeabettersecret!';


const store = new MongoStore({
    mongoUrl: dburl,
    ttl: 24*60*60,
    autoRemove: 'native',
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})
let ses = 
    session({
        saveUninitialized: false,
        secret:secret,
        name:'lpms',
        resave: false,
        sameSite: true,
        store: store,
        maxAge:24*60*60,
    })
router.use(ses)
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.get(
    "/",
    async (req, res) => {
        try{
            res.render("home.ejs", { errorMessage: "" });
        }catch(err){
            console.log(err);
            res.render("home.ejs", { errorMessage: "Unknown error occurred"});
        }
    }
);

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.use(requireLogin)


router.post("/week/create", createWeek)
router.get("/subjects/:subjectId/plan", listWeek);
// router.get("/subjects/:subjectId/plan/:weekId", singleWeek);
router.get("/subjects/:subjectId/plan/viewAllWeeks", viewAllWeeks);
router.get("/subjects/:subjectId/plan/:weekId/delete", deleteWeek);
router.post("/subjects/:subjectId/plan/deleteAllWeeks", deleteAllWeeks);

router.post("/chapter/create", createChapter);
router.get("/subjects/:subjectId/chapter", getChapter);
router.get("/subjects/:subjectId/chapter/:chapterId/delete", deleteChapter);

router.post("/topic/create", createTopic);
router.post("/week/addtopic", addTopicToWeek);
router.get("/subjects/:subjectId/chapter/:chapterId/:topicId/delete", deleteTopic);


router.get("/subjects", getSubject);

router.post("/subject/create", createSubject);

router.get("/subjects/:subjectId/delete", deleteSubject);
router.get("/subjects/:subjectId/chapter/:chapterId/topic/:topicId/:weekId/removeweek", removeWeek);

router.get("/subjects/:subjectId/assignment", getAssignment);
router.get("/subject/assignment/:subjectId/:chapterId/:assignmentId/delete", deleteAssignment);
router.post("/assignment/create", createAssignment)

router.get("/subjects/:subjectId/resource", getResource);
router.get("/subject/resource/:subjectId/:chapterId/:resourceId/delete", deleteResource);
router.post("/resource/create", createResource);


router.get('*', function(req, res){
    res.status(404).render('error.ejs');
});  

module.exports = router;

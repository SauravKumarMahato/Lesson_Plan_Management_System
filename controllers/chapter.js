const Subject = require("../models/subjects");
const User = require("../models/user");
const Plan = require("../models/plan")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getChapter = async (req, res) => {
    const {subjectId} = req.params;

    try{
        const currentUser = await User.findById(req.session.user_id);
        if(!currentUser.subjects.includes(subjectId)) return res.render("dashboard");

        const currentSubject = await Subject.findById(subjectId);
        const currentPlan = await Plan.findById(currentSubject.plan);
        console.log(currentPlan);
        // console.log(currentSubject.chapters);
        return res.render("dashboard_chapter", {
            subjectId,
            plan: currentPlan,
            chapters: currentSubject.chapters, 
        });
    }catch(err){
        console.log(err);
        return res.render("dashboard");
    }
}

exports.createChapter = async(req, res) => {
    const { subjectId, name } = req.body;

    try{
        const currentUser = await User.findById(req.session.user_id);
        if(!currentUser.subjects.includes(subjectId)) return res.render("dashboard");

        const chapter = {
            name 
        };

        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId}, {
            $push: { chapters: chapter}
        });
       
        return res.redirect(`/subjects/${subjectId}/chapter`)
    }catch(err){
        console.log(err);
        return res.render("dashboard");
    }
}

exports.deleteChapter = async(req, res) => {
    const { subjectId, chapterId } = req.params;

    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentSubject = await Subject.findOneAndUpdate({_id: ObjectId(subjectId)},{
            $pull: {
                chapters: { _id: ObjectId(chapterId) }
            }
        });

        if(!currentSubject){
            return res.redirect("/dashboard");
        }

        return res.redirect(`/subjects/${currentSubject._id}/chapter/`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }

}


// exports.deleteChapter = async(req, res) => {
//     const {subjectId} = req.params;

//     try{
//         const currentUser = await User.findById(req.session.user_id);
//         if(!currentUser.subjects.includes(subjectId)) return res.render("dashboard");

//         const currentSubject = await Subject.deleteOne({"_id": ObjectId(subjectId)});
//         console.log(currentSubject);
//         return res.render("dashboard_chapter", {
//             subjectId,
//             chapters: currentSubject.chapters, 
//         });
//     }catch(err){
//         console.log(err);
//         return res.render("dashboard");
//     }

// }
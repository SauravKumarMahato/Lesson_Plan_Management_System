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
            return res.redirect("/subjects");
        }

        const currentSubject = await Subject.findOneAndUpdate({_id: ObjectId(subjectId)},{
            $pull: {
                chapters: { _id: ObjectId(chapterId) }
            }
        });

        if(!currentSubject){
            return res.redirect("/subjects");
        }

        return res.redirect(`/subjects/${currentSubject._id}/chapter/`);
    }catch(err){
        console.log(err);
        return res.redirect("/subjects");
    }

}
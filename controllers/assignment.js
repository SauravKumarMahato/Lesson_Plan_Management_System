const Subject = require("../models/subjects");
const Assignment = require("../models/assignments");
const User = require("../models/user");

const multer = require("multer");
// const path = require("path");

const { storage } = require('../upload/index')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getAssignment = async(req, res) => {
    const { subjectId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)) return res.redirect("/subjects");

        const currentSubject = await Subject.aggregate([
            { $match: { "_id": ObjectId(subjectId) }},
            { $unwind: { path: "$chapters" }},
            { $lookup: {
                from: "assignments",
                localField: "chapters.assignments",
                foreignField: "_id",
                as: "chapters.assignments"
            }},
            { $group: {
                _id: "$_id",
                name: { "$first": "$name"},
                plan: { "$first": "$plan"},
                chapters: {
                    "$push": "$chapters"
                }  
            }}
        ])

        res.render("dashboard_assignments.ejs", { subject: currentSubject[0] });
    }catch(err){
        console.log(err);
        return res.render("dashboard_assignments.ejs");
    }
}

exports.createAssignment = async(req, res) => {
    const { subjectId, chapterId, title, body } = req.body;
    try{

        const upload = multer({
            storage: storage,
        }).single("assignment-file");


        
        upload(req, res, async (err) => {
            if(err){
                console.log(err);
                res.redirect(`/subjects/${subjectId}/assignment`);
            }
            const { subjectId, chapterId, title, body } = req.body;
            const currentUser = await User.findById(req.session.user_id);
           
            if(!currentUser.subjects.includes(subjectId)){
                return res.redirect("/subjects");
            }
            
            const assignment = {
                title: req.body.title,
                body: req.body.body,
                file: req.file?.filename ? req.file.filename : null,
            };

            const currentAssignment = new Assignment(assignment);
            const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
                $push: { "chapters.$.assignments": currentAssignment._id}
            });

            await currentAssignment.save();
            res.redirect(`/subjects/${subjectId}/assignment`);
        });
    }catch(err){
        console.log(err);
        return res.redirect("/subjects");
    }
}


exports.deleteAssignment = async (req, res) => {
    const { subjectId, chapterId, assignmentId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/subjects");
        }

        const currentAssignment = await Assignment.findByIdAndDelete(assignmentId);

        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
            $pull: { "chapters.$.assignments": ObjectId(assignmentId)}
        });

        res.redirect(`/subjects/${subjectId}/assignment`);
    }catch(err){
        console.log(err);
        return res.redirect("/subjects");
    }
}
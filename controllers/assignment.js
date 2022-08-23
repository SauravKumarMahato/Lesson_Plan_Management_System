const Subject = require("../models/subjects");
const Assignment = require("../models/assignments");
const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


// exports.listAssignment = async(req, res) => {
//     try{
//         const { id } = req.params;
//         const ass = await Assignment.find();

//         res.render("dashboard_assignments.ejs", { ass });
//     }catch(err){
//         console.log(err);
//         return res.render("dashboard_assignments.ejs", {ass: null});
//     }
// }


exports.getAssignment = async(req, res) => {
    const { subjectId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)) return res.redirect("/dashboard");

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
        const currentUser = await User.findById(req.session.user_id);
        console.log(currentUser);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }
       
        const assignment = {
            title: req.body.title,
            body: req.body.body,
        };

        const currentAssignment = new Assignment(assignment);
        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
            $push: { "chapters.$.assignments": currentAssignment._id}
        });

        await currentAssignment.save();
        res.redirect(`/subjects/${subjectId}/assignment`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}


exports.deleteAssignment = async (req, res) => {
    const { subjectId, chapterId, assignmentId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/dashboard");
        }

        const currentAssignment = await Assignment.findByIdAndDelete(assignmentId);

        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
            $pull: { "chapters.$.assignments": ObjectId(assignmentId)}
        });

        res.redirect(`/subjects/${subjectId}/assignment`);
    }catch(err){
        console.log(err);
        return res.redirect("/dashboard");
    }
}
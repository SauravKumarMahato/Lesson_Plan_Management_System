const Subject = require("../models/subjects");
const Resource = require("../models/resources");
const User = require("../models/user");

const multer = require("multer");
const { storage} = require("../upload/index");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getResource = async(req, res) => {
    const { subjectId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)) return res.redirect("/subjects");

        const currentSubject = await Subject.aggregate([
            { $match: { "_id": ObjectId(subjectId) }},
            { $unwind: { path: "$chapters" }},
            { $lookup: {
                from: "resources",
                localField: "chapters.resources",
                foreignField: "_id",
                as: "chapters.resources"
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

        res.render("dashboard_resources.ejs", { subject: currentSubject[0] });
    }catch(err){
        console.log(err);
        return res.render("dashboard_resources.ejs");
    }
}

exports.createResource = async(req, res) => {
    try{
        const upload = multer({
            storage: storage,
        }).single("resource-file");
        

        upload(req, res, async (err) => {
            const { subjectId, chapterId, title  } = req.body;
            if(err){
                console.log(err);
                res.redirect(`/subjects/${subjectId}/resource`);
            }

            const currentUser = await User.findById(req.session.user_id);

            if(!currentUser.subjects.includes(subjectId)){
                return res.redirect("/subjects");
            }
        
            const resource = {
                title: title,
                file: req.file.filename,
            };

            const currentResource = new Resource(resource);
            const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
                $push: { "chapters.$.resources": currentResource._id}
            });

            await currentResource.save();
            res.redirect(`/subjects/${subjectId}/resource`);
        });
    }catch(err){
        console.log(err);
        return res.redirect("/subjects");
    }
}


exports.deleteResource = async (req, res) => {
    const { subjectId, chapterId, resourceId } = req.params;
    try{
        const currentUser = await User.findById(req.session.user_id);
        
        if(!currentUser.subjects.includes(subjectId)){
            return res.redirect("/subjects");
        }

        const currentResource = await Resource.findByIdAndDelete(resourceId);

        const currentSubject = await Subject.findOneAndUpdate({_id: subjectId, "chapters._id": chapterId}, {
            $pull: { "chapters.$.resource": ObjectId(resourceId)}
        });

        res.redirect(`/subjects/${subjectId}/resource`);
    }catch(err){
        console.log(err);
        return res.redirect("/subjects");
    }
}
const notFound=(req,res,next)=>{
    const err=new Error(`Route Not Found: ${req.method} ${req.originalUrl}`);
    err.statusCode=404;
    next(err);
}

const errorHandler=(err,req,res,next)=>{
    let statusCode=err.statusCode || 500;
    let message=err.message || "Internal Server Error";
    let errors;
    if(err.name==="ValidationError" && err.errors){
        statusCode=400;
        message="Validation failed";
        errors=Object.values(err.errors).map((e)=>({
            field:e.path,
            message:e.message
        }))
    }
    else if(err.name==="CastError" && err.kind==="ObjectId"){
        statusCode=400;
        message=`Invalid value for ${err.path}`;
    }
    else if(err.type==="entity.parse.failed"){
        statusCode=400;
        message="Invalid JSON in request body";
    }

    if(statusCode===500){
        console.error(err);
    }

    res.status(statusCode).json({
        success:false,
        message,
        ...(errors && {errors}),
        ...(process.env.NODE_ENV==="production"   && statusCode===500 && {stack:err.stack}),
    });
};

module.exports={notFound,errorHandler};

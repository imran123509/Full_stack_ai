import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
     await dbConnect()
     try {
       const {username, email, password}= await request.json()
      const existingUser= await UserModel.findOne({
        username,
        isVerified: true
       })
       
       if(existingUser){
           return Response.json({
               success: false,
               message: "Username is already taken"
           },
           {
            status: 400
           }
        )
       }
       const ExistingUserByEmail =await UserModel.findOne({email})
       const verifyCode=Math.floor(100000+Math.random()*900000).toString()
       if(ExistingUserByEmail){
           if(ExistingUserByEmail.isVerified){
            return Response.json({
                success: false,
                message: "user alredy exits"
            },
            {status: 400}
         )
    }
      else{
        const hashedPassword=await bcrypt.hash(password, 10)
         ExistingUserByEmail.password=hashedPassword
         ExistingUserByEmail.verifyCode=verifyCode
         ExistingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
         await ExistingUserByEmail.save()
      }
       }
       else{
          const hashedPassword=await bcrypt.hash(password, 10)

          const expiryDate=new Date()
          expiryDate.setHours(expiryDate.getHours()+1)
           const newUser= new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
               isVerified: false,
              isAcceptingMessage: true,
              messages: []
            })
            await newUser.save()
       }

     const emailResponse=  await sendVerificationEmail(
           email,
           username,
           verifyCode
       )
       if(!emailResponse.success){
           return Response.json({
               success: false,
               message: emailResponse.message
           },
           {status: 500}
        )
       }
       return Response.json({
          success: true,
          message: "user registered successfully"
       })
     } catch (error) {
        console.error('Eror registering Email', error)
        return Response.json({
             success: false,
             message: "Error registring user"
        },
        {
            status: 500
        }
    )
  }
}
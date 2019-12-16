"use strict";
const chromium = require("chrome-aws-lambda");
var AWS = require("aws-sdk");
// const pug = require("pug");
const handlebar = require("handlebars");
const fs = require("fs");
const path = require("path");

AWS.config.update({ region: "us-east-1" });
const s3 = new AWS.S3({
  httpOptions: {
    timeout: 240000
  }
});

module.exports.hello = async (event, context, callBack) => {
  const dummyData = { 
    "logo": "https://s3.us-east-2.amazonaws.com/tryhaul-1/dermio-logo.svg",
    "consultId":"7007575f-cc77-4cdb-81d7-b02dcb916de7",
    "patientname":"a b",
    "age":21,
    "gender":"Male",
    "patientDob":"05 05 1998",
    "createdAt":"Thu Dec 12 2019",
    "currentMedicalIssue":"21",
    "medical_issues":"21",
    "medication":"NO",
    "allergy":"NO",
    "surgeries":"NO",
    "plan":"",
    "impression":"",
    "impressionDescription":"",
    "sideEffectsString":"",
    "skinCareInstructions":"",
    "url1":"https://s3.us-east-2.amazonaws.com/tryhaul-1/dermio-logo.svg",
    "url2":"https://s3.us-east-2.amazonaws.com/tryhaul-1/dermio-logo.svg",
    "url3":null,
    "url4":null,
    "consultDiagnosisData":[{"checkedDiseaseTypes":null,
    "checkedMedications":null,
    "diagnosisCannotBeEstablished":null,
    "diagnosisDescription":null,
    "diagnosisOption":null,
    "diseaseGroup":null,
    "treatmentCannotBeRecommended":null,
    "treatmentDescription":null,
    "treatmentOption":null,
    "impression":"Acne Vulgaris",
    "plan":"the plan we have..",
    "impressionDescription":"Acne, also known as acne vulgaris, is thought to be caused by multiple factors. Overproduction of a normal oil on the skin, called sebum, increases under the influence of hormones. This, coupled with insufficient shedding of exfoliating dead skin cells, plugs hair follicles.",
    "skinCareInstructions":"skin care instructions",
    "sideEffectsString":"side effect 1",
    "__typename":"ConsultDiagnosisData"}],
    "phone_number":"7655360479",
    "patientAddress":""}

  // console.log("dummyData ",dummyData)

    const executablePath = event.isOffline
      ? "./node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
      : await chromium.executablePath;
    // const template = pug.compileFile("./template.pug");

    try {
      let browser = null;

    console.log("try")
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless
    });

    console.log("browser")
    const page = await browser.newPage();

    let file = fs.readFileSync(path.resolve(__dirname, 'handlebar.hbs'), 'utf8')
    const template = handlebar.compile(file);
    const html = template(dummyData);
    console.log("html ",html)
    // await page.emulateMedia('screen')
    await page.setContent(html);

    console.log("setContent")
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      width: "8.27in",
      height: "11.7in"
      // margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
    });
    console.log("pdf")
    // TODO: Response with PDF (or error if something went wrong )
    const response = {
      headers: {
        "Content-type": "application/pdf",
        "content-disposition": "attachment; filename=test.pdf"
      },
      statusCode: 200,
      body: pdf.toString("base64"),
      isBase64Encoded: true
    };

    const output_filename = `handlebar.pdf`;

    const s3Params = {
      Bucket: "pdf-puppeteer",
      Key: `public/pdfs/${output_filename}`,
      Body: pdf,
      ContentType: "application/pdf",
      // ServerSideEncryption: "AES256"
    };
     console.log("s3")
    // console.log("s3Params ",s3Params);
   await s3.putObject(s3Params, async (err, data) => {
    if(err){
      console.log("err ",err)
    }else{
      console.log("data ",data)
    }
      console.log("resp",resp)
      if (browser !== null) {
            await browser.close();
            return context.succeed(response);
          }
      // if (err) {
      //   console.log("error", err);
      //   return callBack(null, { error });
      // }else{
      // 	console.log("upload succeed ",response);
      //    console.log("finally")
      //     if (browser !== null) {
      //       await browser.close();
      //       return context.succeed(response);
      //     }
      // }
    });
    // fs.writeFileSync("invoice.pdf", pdf); // Locally
  } catch (error) {
  	console.log("Failure ",error)
    return context.fail(error);
  } 
  // finally {
  // 	 console.log("finally")
  //   if (browser !== null) {
  //     await browser.close();
  //   }
  // }
};
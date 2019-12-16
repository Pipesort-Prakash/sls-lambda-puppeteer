const chromium = require("chrome-aws-lambda");
const handlebar = require("handlebars");
const fs = require("fs");
const path = require("path");

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

const createPdf=async()=> {
	 // const executablePath = "./node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
  //   || await chromium.executablePath;
  // const template = pug.compileFile("./template.pug");
  let file = fs.readFileSync(path.resolve(__dirname, 'handlebar.hbs'), 'utf8')
  const template = handlebar.compile(file);
  const html = template(dummyData);

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePathL:  await chromium.executablePath,
      headless: true
    });

    const page = await browser.newPage();
    await page.emulateMedia('screen')
    await page.setContent(html);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
    });
    fs.writeFileSync("invoice.pdf", pdf);
}catch (error) {
  	console.log("Failure ",error)
  } 
  finally {
  	 console.log("finally")
    if (browser !== null) {
      await browser.close();
    }
  }
}
createPdf();
 
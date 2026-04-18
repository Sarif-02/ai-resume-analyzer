import React, { useState } from 'react'
import Navbar from '~/components/Navbar'
import { Form, useNavigate } from "react-router";
import FileUploader from '~/components/FileUploader'
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/format';
import { prepareInstructions } from '../../constants';

function upload() {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setisProcessing] = useState(false);
  const [statusText, setstatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
    setisProcessing(true);
    setstatusText('Uploading the files...');

    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setstatusText('Error: Failed To Uplaod File');

    if (!fs) {
      setstatusText("Error: File system not initialized");
      return;
    }

    setstatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) return setstatusText('Error Failed to convert PDF to image');

    setstatusText('Uploading the image ... ');
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setstatusText('Error: Failed to upload image');
    setstatusText('Preparing data...');

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName, jobTitle, jobDescription,
      feedback: '',
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setstatusText('Analyzing...');

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    )
    if (!feedback) return setstatusText('Error: Failed to analyze resume');

    const feedbackText = typeof feedback.message.content === 'string'
      ? feedback.message.content
      : feedback.message.content[0].text;

    console.log("Raw feedback text:", feedbackText);

    try {
      const parsedFeedback = JSON.parse(feedbackText);
      console.log("✅ Parsed feedback successfully:", parsedFeedback);
      console.log("📊 Scores breakdown:");
      console.log("  - Overall Score:", parsedFeedback?.overallScore);
      console.log("  - ATS Score:", parsedFeedback?.ATS?.score);
      console.log("  - Content Score:", parsedFeedback?.content?.score);
      console.log("  - Structure Score:", parsedFeedback?.structure?.score);
      console.log("  - Tone & Style Score:", parsedFeedback?.toneAndStyle?.score);
      console.log("  - Skills Score:", parsedFeedback?.skills?.score);
      data.feedback = parsedFeedback;
    } catch (error) {
      console.error("❌ Failed to parse feedback:", error);
      console.error("Feedback text was:", feedbackText);
      setstatusText('Error: Failed to parse feedback');
      return;
    }
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setstatusText('Analysis complete, redirecting...');

    console.log(data);
    navigate(`/resume/${uuid}`);

  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;
    const formData = new FormData(form);

    const companyName: FormDataEntryValue | null = formData.get('company-name') as string;
    const jobTitle: FormDataEntryValue | null = formData.get('job-title') as string;
    const jobDescription: FormDataEntryValue | null = formData.get('job-description') as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });

  }


  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className='page-heading py-18'>
          <h1>Smart feedback for your dream Job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" alt="" className='w-full' />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <Form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              <div className='form-div'>
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name='company-name' placeholder='Company Name' id='company-name' />
              </div>
              <div className='form-div'>
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name='job-title' placeholder='Job Title' id='job-title' />
              </div>
              <div className='form-div'>
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description' />
              </div>
              <div className='form-div'>
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className='primary-button' type='submit'>
                Analyze Resume
              </button>
            </Form>
          )}
        </div>
      </section>
    </main>
  )
}

export default upload


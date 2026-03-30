import React, { useState } from 'react'
import Navbar from '~/components/Navbar'
import { Form } from "react-router";
import FileUploader from '~/components/FileUploader'

function upload() {
  const [isProcessing, setisProcessing] = useState(false);
  const [statusText, setstatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   const form = e.currentTarget.closest('form');
   if(!form) return;
   const formData = new FormData(form);

   const companyName : FormDataEntryValue | null = formData.get('company-name');
   const jobTitle : FormDataEntryValue | null = formData.get('job-title');
   const jobDescription : FormDataEntryValue | null = formData.get('job-description');

   console.log({
    companyName, jobTitle, jobDescription, file
   })
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
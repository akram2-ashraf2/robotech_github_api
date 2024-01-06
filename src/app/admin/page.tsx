"use client"


///// 1. Uplaod products by using json file

// import { useState, ChangeEvent } from 'react';
// import { Octokit } from '@octokit/rest';

// export default function Home() {
//   const [file, setFile] = useState<File | null>(null);

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0];
//     setFile(selectedFile);
//   };

//   const updateFile = async () => {
//     if (!file) {
//       console.error('Please select a file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       const updatedContent = event.target?.result as string;

//       // GitHub repository information
//       const owner = 'Akram-44';
//       const repo = 'api';
//       const path = 'robotech/pages/faq.json';
//       const token = process.env.REACT_APP_GITHUB_TOKEN;

//       // Create an Octokit instance with your token
//       const octokit = new Octokit({ auth: token });

//       // Get the current file information
//       try {
//         const response = await octokit.repos.getContent({
//           owner,
//           repo,
//           path,
//         });

//         const sha = response.data.sha;

//         // Update the file on GitHub
//         await octokit.repos.createOrUpdateFileContents({
//           owner,
//           repo,
//           path,
//           message: 'Update JSON file',
//           content: Buffer.from(updatedContent).toString('base64'),
//           sha,
//         });

//         console.log('JSON file updated successfully!');
//       } catch (error) {
//         console.error('Error updating JSON file:', error.message);
//       }
//     };

//     reader.readAsText(file);
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={updateFile}>Update JSON File</button>
//     </div>
//   );
// }




import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Octokit } from '@octokit/rest';
import Container from "@/components/Container";

export default function Home() {
const [jsonArray, setJsonArray] = useState<any[]>([]);
const [newQuestion, setNewQuestion] = useState('');
const [newAnswer, setNewAnswer] = useState('');
const [error, setError] = useState<string | null>(null);

useEffect(() => {
// Fetch the existing JSON file from GitHub
const fetchData = async () => {
const owner = 'Akram-44';
const repo = 'api';
const path = 'robotech/pages/faq.json';
const token = process.env.REACT_APP_GITHUB_TOKEN; ;


  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = response.data.content;
    const decodedContent = Buffer.from(content, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedContent);
    setJsonArray(parsedData);
  } catch (error) {
    console.error('Error fetching JSON file:', error.message);
    setError('Error fetching JSON file. Check console for details.');
  }
};

fetchData();
}, []);

const handleQuestionChange = (event: ChangeEvent<HTMLInputElement>) => {
setNewQuestion(event.target.value);
};

const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
setNewAnswer(event.target.value);
};

const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();


// Add a new object to the JSON array
const updatedArray = [...jsonArray, { question: newQuestion, answer: newAnswer }];

// GitHub repository information
const owner = 'Akram-44';
const repo = 'api';
const path = 'robotech/pages/faq.json';
const token = process.env.REACT_APP_GITHUB_TOKEN;

const octokit = new Octokit({ auth: token });

try {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!response || !response.data || !response.data.sha) {
    setError('Invalid response or missing SHA.');
    return;
  }

  const sha = response.data.sha;

  // Update the file on GitHub with the modified content
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: 'Update JSON file',
    content: Buffer.from(JSON.stringify(updatedArray, null, 2)).toString('base64'),
    sha,
  });

  console.log('JSON file updated successfully!');
  setError(null);
} catch (error) {
  console.error('Error updating JSON file:', error.message);

  if (error.status === 401) {
    setError('Bad credentials or insufficient permissions.');
  } else {
    setError(`Error updating JSON file. Check console for details.`);
  }
}
};

return (
  <Container>
  <div className="container mx-auto my-8">
  <h2 className="text-2xl font-bold mb-4">Current JSON Data:</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Question</th>
          <th className="border px-4 py-2">Answer</th>
        </tr>
      </thead>
      <tbody>
        {jsonArray.map((item, index) => (
          <tr key={index}>
            <td className="border px-4 py-2">{item.question}</td>
            <td className="border px-4 py-2">{item.answer}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {error && <p className="text-red-500">{error}</p>}

  <form onSubmit={handleFormSubmit} className="mt-4">
    <label className="block mb-2">
      Question:
      <input
        type="text"
        value={newQuestion}
        onChange={handleQuestionChange}
        className="border rounded px-4 py-2 w-full sm:w-64"
      />
    </label>
    <label className="block mb-2">
      Answer:
      <input
        type="text"
        value={newAnswer}
        onChange={handleAnswerChange}
        className="border rounded px-4 py-2 w-full sm:w-64"
      />
    </label>
    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
      Add QA Pair
    </button>
  </form>
</div>
</Container>
);
}


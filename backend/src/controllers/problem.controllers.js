import {db} from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // getting all data from req.body
  // loop through each reference solution for different language
  
  // remaining : id, userId, hints, editorial
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions
  } = req.body
  
  try {
    for(const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if(!languageId) {
        return res.status(400).json({
          success: false,
          error: "Invalid language"
        })
      }

      // testcase => [{input: "", output: ""}]
      const submissions = testcases.map(({input, output}) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output
      }))

      console.log("sending Submissions...")
      let submissionResults = await submitBatch(submissions);
      
      console.log("extracting tokens...")
      let tokens = submissionResults.map((res) => res.token);

      console.log("polling results...")
      let results = await pollBatchResults(tokens);

      console.log("successfully polled results...")

      for(let i=0; i<results.length; i++) {
        const result = results[i];
        console.log(
          `Testcase ${i+1} for language ${language}: `,
          result
        )

        if(result.status.id !== 3) {
          return res.status(400).json({
            success: false,
            error: `testcase ${i+1} failed for language ${language}`
          })
        }
      }
      
      console.log("saving to db...")
      const newProblem = await db.Problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples, 
          constraints,
          testcases, 
          codeSnippets,
          referenceSolutions,
          userId: req.user.id
        }
      })

      console.log("problem created successfully!")
      return res.status(200).json({
        success: true,
        data: newProblem
      })
    }
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in creating problem"
    })
  }
}

export const getAllProblems = async (req, res) => {

}

export const getProblemById = async (req, res) => {

}

export const updateProblem = async (req, res) => {

}

export const deleteProblem = async (req, res) => {
  
}

export const getSolvedProblems = async (req, res) => {
  
}
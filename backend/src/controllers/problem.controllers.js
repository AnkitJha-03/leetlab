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
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in creating problem"
    })
  }
}

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.Problem.findMany();

    if(!problems.length) {
      return res.status(404).json({
        success: false,
        error: "No problems found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "All problems fetched successfully",
      problems
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching problems"
    })
  }
}

export const getProblemById = async (req, res) => {
  const {id} = req.params;

  try {
    const problem = await db.Problem.findUnique({
      where: {
        id
      }
    })

    console.log("found", problem);
  
    if(!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problem
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching problem"
    })
  }
}

export const updateProblem = async (req, res) => {
  const {id} = req.params;

  try {
    const problem = await db.Problem.findUnique({
      where: {
        id
      }
    })

    if(!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found"
      })
    }

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
    } = req.body;
    
    // validation
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
    }

    console.log("saving to db...")
    await db.Problem.update({
      where: {
        id
      },
      data: {
        ...req.body
      }
    })

    console.log("Problem updated sucessfully!");

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem
    })
  
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching problem"
    })
  }
}

export const deleteProblem = async (req, res) => {
  const {id} = req.params;

  try {
    const problem = await db.Problem.findUnique({
      where: {
        id
      }
    })

    if(!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem doesn't exisits"
      })
    }

    await db.Problem.delete({
      where: {
        id
      }
    });

    return res.status(204).json({
      success: true,
      message: "Problem deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in deleting problem"
    })
  }
}

export const getSolvedProblems = async (req, res) => {
  
}
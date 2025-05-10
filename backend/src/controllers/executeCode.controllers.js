import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  const {source_code, language_id, stdin, problem_id, expected_outputs} = req.body;
  const userId = req.body.id;

  try {
    // 1. validate test case
    if(
      !Array.isArray(stdin) ||
      !Array.isArray(expected_outputs) ||
      stdin.length === 0 ||
      stdin.length !== expected_outputs.length
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid test case"
      })
    }

    // 2. prepare each test cases for judge 0
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin:input
    }))

    // 3. send batch of submissions to judge)
    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res) => res.token);

    const results = await pollBatchResults(tokens);


    console.log("resluts....");
    console.log(results)



    return res.status(200).json({
      success: true,
      message: "Code executed successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in executing code"
    })
  }
}
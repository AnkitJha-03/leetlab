import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  const {source_code, language_id, stdin, problemId, expected_outputs} = req.body;
  const userId = req.user.id;

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
    console.log("submitting results...");
    const submitResponse = await submitBatch(submissions);

    console.log("executing tokens...");
    const tokens = submitResponse.map((res) => res.token);

    console.log("polling results...");
    const results = await pollBatchResults(tokens);
    // console.log("results: ",results);

    // 4. analyzing results
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      console.log(result, i);
      const expectedOutput = expected_outputs[i].trim();
      const stdout = result.stdout.trim();
      const passed = stdout === expectedOutput;

      if(!passed) allPassed = false;

      return {
        testCase: i+1,
        passed,
        stdout,
        expected: expectedOutput,
        stderr: result.stderr || null,
        status: result.status.description,
        compiledOutput: result.compiled_output || null,
        time: result.time? `${result.time} s` : undefined,
        memory: result.memory? `${result.memory} KB` : undefined,
      }
    })

    console.log(detailedResults);

    // 5. insert into database
    console.log("inserting submission into database...");
    const submission = await db.Submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compiledOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    // 6. if all passed => mark problem as solved for user
    console.log("inserting problem solved into database...");
    if(allPassed) {
      await db.ProblemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId
          }
        },
        update: {},
        create: {
          userId,
          problemId
        }
      })
    }

    // 7. save individual test case results using detailedResults
    const testCaseResults = detailedResults.map((res) => ({
      submissionId: submission.id,
      testCase: res.testCase,
      passed: res.passed,
      stdout: res.stdout,
      expected: res.expected,
      stderr: res.stderr,
      status: res.status,
      compiledOutput: res.compiledOutput,
      time: res.time,
      memory: res.memory
    }))

    console.log(testCaseResults)
    console.log("inserting test case results into database...");
    await db.TestCaseResult.createMany({
      data: testCaseResults
    })

    console.log("fetching submission with test cases...");
    const submissionWithTestCase = await db.Submission.findUnique({
      where:{
        id: submission.id
      },
      include: {
        testcases: true
      }
    })

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submissions: submissionWithTestCase
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in executing code"
    })
  }
}
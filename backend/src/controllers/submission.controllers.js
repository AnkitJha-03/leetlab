import db from "../utils/db";

export const getAllSubmissions = async (req, res) => {
  const userId = req.user.id;
  try {
    const submissions = await db.submission.findMany({
      where: {
        userId
      }
    })

    return res.status(200).json({
      success: true,
      message: "All submissions fetched successfully",
      submissions
    })
  } catch (error) {
    console.error("Error in fetching submissions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching submissions"
    })
  }
}

export const getSubmissionsForProblem = async (req, res) => {
  const userId = req.user.id;
  const problemId = req.params.id;

  try {
    const submissions = await db.submission.findMany({
      where: {
        userId,
        problemId
      }
    })

    return res.status(200).json({
      success: true,
      message: "All submissions fetched successfully",
      submissions
    })
  } catch (error) {
    console.error("Error in fetching submissions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching submissions"
    })
  }
}

export const getAllSubmissionForProblem = async (req, res) => {
  const problemId = req.params.id;

  try {
    const submissions = await db.submission.count({
      where: {
        problemId
      }
    })

    return res.status(200).json({
      success: true,
      message: "All submissions fetched successfully",
      count: submissions
    })
  } catch (error) {
    console.error("Error in fetching submissions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching submissions"
    })
  }
}
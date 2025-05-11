import {db} from "../libs/db.js";

export const getAllSheets = async (req, res) => {
  try {
    const sheets = await db.Sheet.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        problems: {
          include: {
            problem: true
          }
        }
      }
    });

    if(!sheets) {
      return res.status(404).json({
        success: false,
        error: "No sheets found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "All sheets fetched successfully",
      sheets
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching sheets"
    })
  }
}

export const getSheetById = async (req, res) => {
  const sheetId = req.params.id;
  
  try {
    const sheet = await db.Sheet.findUnique({
      where: {
        id: sheetId,
        userId: req.user.id
      },
      include: {
        problems:{
          include:{
            problem: true
          }
        }
      }
    })

    if(!sheet) {
      return res.status(404).json({
        success: false,
        error: "Sheet not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Sheet fetched successfully",
      sheet
    })
  } catch (error) {
    console.error("Error in fetching sheet:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching sheet"
    })
  }
}

export const createSheet = async (req, res) => {
  const {name, descrription} = req.body;
  const userId = req.user.id;

  try {
    const sheet = await db.Sheet.create({
      data: {
        name,
        descrription,
        userId
      }
    })

    return res.status(201).json({
      success: true,
      message: "Sheet created successfully",
      sheet
    })
  } catch (error) {
    console.error("Error in creating sheet:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in fetching sheets"
    })
  }
}

export const deleteSheet = async (req, res) => {
  const {id} = req.params;

  try {
    const sheet = await db.Sheet.findUnique({
      where: {
        id,
        userId: req.user.id
      }
    })

    if(!sheet) {
      return res.status(404).json({
        success: false,
        error: "Sheet not found"
      })
    }

    await db.Sheet.delete({
      where: {
        id
      }
    })

    return res.status(204).json({
      success: true,
      message: "Sheet deleted successfully"
    })
  } catch (error) {
    console.error("Error in deleting sheet:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in deleting sheet"
    })
  }
}

export const addProblemsToSheet = async (req, res) => {
  const {sheetId} = req.params;
  const {problemIds} = req.body;

  try {
    if(!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Problem ids must be an array"
      })
    }

    const problemsInSheet = await db.ProblemInSheet.createMany({
      data: problemIds.map((problemId) => ({
        sheetId,
        problemId
      }))
    })

    res.status(201).json({
      success: true,
      message: "Problems added to playlist successfully",
      problemsInSheet
    })
  } catch (error) {
    console.error("Error in adding problems to playlist:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in adding problems to playlist"
    })
  }
}

export const removeProblemsFromSheet = async (req, res) => {
  const {sheetId} = req.params;
  const {problemIds} = req.body;

  try {
    if(!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Problem ids must be an array"
      })
    }

    const deletedProblems = await db.ProblemInSheet.deleteMany({
      where: {
        sheetId,
        problemId: {
          in: problemIds
        }
      }
    })

    return res.status(200).json({
      success: true,
      message: "Problems removed from playlist successfully",
      deletedProblems
    })
  } catch (error) {
    console.error("Error in removing problems from playlist:", error);
    return res.status(500).json({
      success: false,
      error: "Internal issue in removing problems from playlist"
    })
  }
}
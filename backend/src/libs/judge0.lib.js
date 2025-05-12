export const getJudge0LanguageId = (language) => {
  const languageMap = {
    "JAVASCRIPT": 63,
    "JAVA": 62,
    "PYTHON": 71
  }

  return languageMap[language.toUpperCase()];
}

export const getLanguageName = (languageId) => {
  const languageMap = {
    63: "JAVASCRIPT",
    62: "JAVA",
    71: "PYTHON"
  }
  return languageMap[languageId];
}

import axios from "axios";

export const submitBatch = async (submissions) => {
  const {data} = await axios.post(`${process.env.JUDGE0_BASE_URL}/submissions/batch?base64_encoded=false`, {submissions});

  return data;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while(true) {
    const {data} = await axios.get(`${process.env.JUDGE0_BASE_URL}/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: true
      }
    });
    
    const results = data.submissions;

    const isAllDone = results.every((res) => res.status.id!==1 && res.status.id!==2);

    if(isAllDone) return results;
    await sleep(1000);
  }
}
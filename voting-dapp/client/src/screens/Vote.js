import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import Candidate from "../components/CandidateCard";

export default function Vote({ role, contract, web3, currentAccount }) {
  const [candidates, setCandidates] = useState([]);
  const [vote, setVote] = useState(null);
  const [electionState, setElectionState] = useState(0);

  const getCandidates = async () => {
    try {
      if (contract) {
        const count = await contract.methods.getCandidatesCount().call();
        const temp = [];
        for (let i = 0; i < count; i++) {
          const candidate = await contract.methods.getCandidateDetails(i).call();
          temp.push({ name: candidate[0], votes: candidate[1] });
        }
        setCandidates(temp);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const getElectionState = async () => {
    try {
      if (contract) {
        const state = await contract.methods.getElectionState().call();
        setElectionState(parseInt(state));
      }
    } catch (error) {
      console.error("Error fetching election state:", error);
    }
  };

  const voteCandidate = async (candidateId) => {
    try {
      if (contract) {
        await contract.methods.vote(candidateId).send({ from: currentAccount });
        getCandidates(); // Refresh vote counts
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleVoteChange = (event) => {
    setVote(event.target.value);
  };

  const handleVote = (event) => {
    event.preventDefault();
    voteCandidate(vote);
  };

  useEffect(() => {
    if (contract) {
      getElectionState();
      getCandidates();
    }
  }, [contract]);

  return (
    <Box>
      <form onSubmit={handleVote}>
        <Grid container sx={{ mt: 0 }} spacing={6} justifyContent="center">
          <Grid item xs={12}>
            <Typography align="center" variant="h6">
              {electionState === 0 && "Please Wait... Election has not started yet."}
              {electionState === 1 && "VOTE FOR YOUR FAVOURITE CANDIDATE"}
              {electionState === 2 && "Election has ended. See the results below."}
            </Typography>
            <Divider />
          </Grid>

          {electionState === 1 && (
            <>
              <Grid item xs={12}>
                <FormControl>
                  <RadioGroup
                    row
                    sx={{
                      overflowY: "hidden",
                      overflowX: "auto",
                      display: "flex",
                      width: "98vw",
                      justifyContent: "center",
                    }}
                    value={vote}
                    onChange={handleVoteChange}
                  >
                    {candidates.map((candidate, index) => (
                      <FormControlLabel
                        key={index}
                        labelPlacement="top"
                        control={<Radio />}
                        value={index}
                        label={<Candidate id={index} name={candidate.name} />}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <div style={{ margin: 20 }}>
                  <Button type="submit" variant="contained" sx={{ width: "100%" }}>
                    Vote
                  </Button>
                </div>
              </Grid>
            </>
          )}

          {electionState === 2 && (
            <Grid
              item
              xs={12}
              sx={{
                overflowY: "hidden",
                overflowX: "auto",
                display: "flex",
                width: "98vw",
                justifyContent: "center",
              }}
            >
              {candidates.map((candidate, index) => (
                <Box sx={{ mx: 2 }} key={index}>
                  <Candidate id={index} name={candidate.name} voteCount={candidate.votes} />
                </Box>
              ))}
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}

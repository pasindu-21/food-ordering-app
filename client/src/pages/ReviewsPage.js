import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const ReviewDetails = () => {
  const { id } = useParams(); // Get review ID from URL
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReview(res.data);
      } catch (err) {
        console.error('Error fetching review:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!review) return <Typography>Review not found.</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h5">{review.user.name}'s Review</Typography>
      <Typography>Rating: {review.rating}</Typography>
      <Typography>Comment: {review.comment}</Typography>
      {/* Add replies if needed */}
      {review.replies && review.replies.map((reply) => (
        <Box key={reply._id} mt={2}>
          <Typography>{reply.owner.name}: {reply.comment}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ReviewDetails;

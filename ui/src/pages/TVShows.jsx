import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies, getGenres } from '../store';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../utils/firebase-config';
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Slider from '../components/Slider';
import NotAvailable from "../components/NotAvailable";
import SelectGenre from '../components/SelectGenre';

export default function TVShows() {

    const [isScrolled, setIsScrolled] = useState(false);
    const movies = useSelector((state) => state.flixxit.movies);
    const genres = useSelector((state) => state.flixxit.genres);
    const genresLoaded = useSelector((state) => state.flixxit.genresLoaded);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      if (!genres.length) dispatch(getGenres());
    }, [dispatch, genres.length]);

    useEffect(() => {
    if (genresLoaded) {
      dispatch(fetchMovies({ genres,type: "tv" }));
    }
    }, [dispatch, genres, genresLoaded]);

    window.onscroll = () => {
    setIsScrolled(window.scrollY === 0 ? false : true);
    return () => (window.onscroll = null);
  };
  
  const [user, setUser] = useState(undefined);

  onAuthStateChanged(firebaseAuth, (currentUser)=> {
    if (currentUser) setUser(currentUser.uid);
    else navigate("/login");
  });

  return (
    <Container>
    <div className="navbar">
      <Navbar isScrolled={isScrolled} />
    </div>
    <div className="data">
      <SelectGenre genres={genres} type="tv" />
      {movies.length ? <Slider movies={movies} /> : <NotAvailable />}
    </div>
  </Container>
);
}

const Container = styled.div`
.data {
  margin-top: 8rem;
  .not-available {
    text-align: center;
    color: white;
    margin-top: 4rem;
  }
}
`;

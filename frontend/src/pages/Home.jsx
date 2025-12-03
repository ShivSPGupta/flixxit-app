import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import { getFavorites } from '../redux/slices/favoritesSlice';

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFavorites());
  }, [dispatch]);

  const movieCategories = [
    { title: 'Trending Now', keyword: 'trending' },
    { title: 'Action Movies', keyword: 'action' },
    { title: 'Marvel Collection', keyword: 'marvel' },
    { title: 'Batman Collection', keyword: 'batman' },
    { title: 'Comedy Movies', keyword: 'comedy' },
    { title: 'Horror Movies', keyword: 'horror' },
    { title: 'Romance Movies', keyword: 'romance' },
    { title: 'Sci-Fi Movies', keyword: 'sci-fi' },
    { title: 'Documentary Films', keyword: 'documentary' },
    { title: 'Thriller Movies', keyword: 'thriller' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Banner />
      
      <div className="relative -mt-20 z-10">
        {movieCategories.map((category, index) => (
          <Row
            key={category.keyword}
            title={category.title}
            keyword={category.keyword}
            isLarge={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
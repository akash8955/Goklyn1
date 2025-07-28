import React from 'react';
import { Outlet } from 'react-router-dom';
import NewsList from '../pages/news/NewsList';
import NewsForm from '../pages/news/NewsForm';
import NewsDetail from '../pages/news/NewsDetail';

const NewsLayout = () => (
  <div className="news-layout">
    <Outlet />
  </div>
);

const newsRoutes = {
  path: 'news',
  element: <NewsLayout />,
  children: [
    {
      index: true,
      element: <NewsList />,
    },
    {
      path: 'create',
      element: <NewsForm />,
    },
    {
      path: 'edit/:id',
      element: <NewsForm isEditMode={true} />,
    },
    {
      path: ':id',
      element: <NewsDetail />,
    },
  ],
};

export default newsRoutes;

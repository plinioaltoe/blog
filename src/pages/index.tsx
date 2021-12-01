import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  // setPosts(postsPagination.results)

  console.log(postsPagination)

  return (
    <main className={commonStyles.postContainer}>
      <div className={styles.content}>
        {posts.map(({ data, uid }) =>
          <a href="#" key={uid}>
            <div className={styles.title}>
              <h1>{data.title}</h1>
              <span>{data.subtitle}</span>
            </div>
            <div className={styles.details}>
              <div className={styles.info}>
                <img src="/images/calendar.svg" alt="calendar" />
                <span>15 Mar 2021</span>
              </div>
              <div className={styles.info}>
                <img src="/images/user.svg" alt="user" />
                <span>{data.author}</span>
              </div>
            </div>
          </a>
        )}
      </div>

      <span className={styles.loadMore}>Carregar mais posts</span>
    </main >
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse: PostPagination = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'posts')
    ],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 3
    }
  );

  const results = postsResponse?.results?.map(({ uid, first_publication_date, data }) => ({
    uid,
    first_publication_date,
    data,
  }))

  const postsPagination = {
    results,
    next_page: postsResponse.next_page
  }
  
  return {
    props: {
      postsPagination
    }
  }
};

import { GetStaticProps } from 'next';

import { FiUser, FiCalendar } from "react-icons/fi";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import React, { useState } from 'react';
import Link from 'next/link';

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

  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)


  const handleClick = () => {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const { results, next_page } = handleDataPosts(data)
        setPosts([...posts, ...results])
        setNextPage(next_page)
      })
  }

  return (
    <main className={commonStyles.postContainer}>
      {posts.map(({ data, uid, first_publication_date }) =>
        <div className={styles.content} key={uid}>
          <Link href={`/post/${uid}`}>
            <a>
              <div className={styles.title}>
                <h1>{data.title}</h1>
                <span>{data.subtitle}</span>
              </div>
              <div className={styles.details}>
                <div className={styles.info}>
                  <FiCalendar />
                  <span>{first_publication_date}</span>
                </div>
                <div className={styles.info}>
                  <FiUser />
                  <span>{data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        </div>
      )}

      {nextPage &&
        <span
          className={styles.loadMore}
          onClick={handleClick}
        >
          Carregar mais posts
        </span>
      }
    </main >
  )
}

const handleDataPosts = (postsResponse: PostPagination): PostPagination => {
  const results = postsResponse?.results?.map(({ uid, first_publication_date, data }) => {
    return {
      uid,
      first_publication_date: format(
        new Date(first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      ),
      data,
    }
  })
  return {
    results,
    next_page: postsResponse.next_page
  }
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse: PostPagination = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'posts')
    ],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1
    }
  );

  return {
    props: {
      postsPagination: handleDataPosts(postsResponse)
    }
  }
};

import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

import styles from './GatheringDetailPage.module.scss';

// 마크다운 프리뷰 컴포넌트를 직접 경로에서 지연 로딩
const MarkdownPreview = lazy(() => import('@/features/gathering/ui/GatheringMarkdownPreview'));

import { GatheringDetailUserInfo } from '@/features/gathering';
import { useGatheringDetail, useGatheringLike } from '@/features/gathering/lib/hooks';
import { Loader, TripleDot } from '@/shared/ui';
import { customToast, errorAlert } from '@/shared/ui';
import { LikeBtn } from '@/shared/ui/LikeBtn/LikeBtn';
import { GatheringDetailBtnCon, GatheringDetailHeader, GatheringDetailGrid } from '@/widgets';

// 마크다운 로딩 Fallback 컴포넌트
const MarkdownLoadingFallback = () => (
  <div className={styles.markdownLoading}>
    <div className={styles.shimmer}></div>
    <div className={styles.shimmer} style={{ width: '80%' }}></div>
    <div className={styles.shimmer} style={{ width: '90%' }}></div>
    <div className={styles.shimmer} style={{ width: '70%' }}></div>
  </div>
);

export const GatheringDetailPage = () => {
  const { gatheringId } = useParams();
  const { data, isLoading, isError } = useGatheringDetail(gatheringId!);

  const { mutate: toggleLike, isPending } = useGatheringLike({
    gatheringId: gatheringId!,
    onSuccess: () => {
      customToast({ text: '이 게시물에 좋아요를 눌렀습니다.', timer: 3000, icon: 'success' });
    },
    onError: () => {
      errorAlert({ title: '좋아요 실패', text: '좋아요를 누르는데 실패했습니다.' });
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div>
        <TripleDot />
        게더링 정보를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div>
        <TripleDot />
        게더링을 찾을 수 없습니다.
      </div>
    );
  }

  const gatheringDetail = data?.data;

  return (
    <div className={styles.container}>
      <GatheringDetailHeader title={gatheringDetail.title} username={gatheringDetail.username} />
      <GatheringDetailGrid
        contact={gatheringDetail.contact}
        contactUrl={gatheringDetail.contactUrl}
        createTime={gatheringDetail.createTime}
        deadLine={gatheringDetail.deadLine}
        gatheringTag={gatheringDetail.gatheringTag}
        period={gatheringDetail.period}
        personnel={gatheringDetail.personnel}
        positions={gatheringDetail.positions}
        sort={gatheringDetail.sort}
        subject={gatheringDetail.subject}
        username={gatheringDetail.username}
      />

      <section className={styles.detailSection}>
        <h3>상세소개</h3>
        <article className={styles.content}>
          {/* 마크다운 컴포넌트 지연 로딩 */}
          <Suspense fallback={<MarkdownLoadingFallback />}>

            <MarkdownPreview markdownText={gatheringDetail.content} />
          </Suspense>
        </article>
      </section>
      <div className={styles.footer}>
        <div className={styles.stats}>
          <LikeBtn
            disabled={isPending}
            isLiked={gatheringDetail.isLiked}
            onLikeClick={toggleLike}
          />
        </div>
        <GatheringDetailUserInfo username={gatheringDetail.username} />
        <GatheringDetailBtnCon gatheringId={gatheringId} userId={gatheringDetail.userId} />
      </div>
    </div>
  );
};

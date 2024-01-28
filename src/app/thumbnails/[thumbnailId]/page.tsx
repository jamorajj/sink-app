'use client';

import { useMutation, useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import Image from 'next/image';
import { getImageUrl, shuffleArray } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from '@clerk/nextjs';
import { Progress } from '@/components/ui/progress';
import { useRef } from 'react';

export default function ThumbnailPage() {
  const params = useParams<{ thumbnailId: Id<'thumbnails'> }>();
  const thumbnail = useQuery(api.thumbnails.getThumbnail, {
    thumbnailId: params.thumbnailId,
  });

  const session = useSession();

  const voteOnThumbnail = useMutation(api.thumbnails.voteOnThumbnail);

  const refImages = useRef<string[] | undefined>(undefined);

  if (!thumbnail || !session.session) {
    return <div>Loading...</div>;
  }

  const hasVoted = thumbnail.voteIds.includes(session.session?.user.id);

  function getVotesFor(imageId: string) {
    if (!thumbnail) {
      return 0;
    }
    return thumbnail?.aImage === imageId ? thumbnail.aVotes : thumbnail?.bVotes;
  }

  function getVotePercent(imageId: string) {
    if (!thumbnail) {
      return 0;
    }
    const totalVotes = thumbnail?.aVotes + thumbnail?.bVotes;

    if (totalVotes === 0) {
      return 0;
    }
    return Math.round(getVotesFor(imageId) / totalVotes * 100);
  }

  if(!refImages.current) {
    refImages.current = shuffleArray([
      thumbnail?.aImage,
      thumbnail?.bImage,
    ]) as string[];
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">Test image A</h2>

          <Image
            width="400"
            height="400"
            alt="Image Test A"
            className="w-full"
            src={getImageUrl(refImages.current[0])}
          />

          {hasVoted ? (
            <>
              <Progress value={getVotePercent(refImages.current[0])} className="w-full" />
              <div className="text-lg">{getVotesFor(refImages.current[0])} votes</div>
            </>
          ) : (
            <Button
              onClick={() =>
                voteOnThumbnail({
                  thumbnailId: thumbnail._id,
                  imageId: refImages.current[0],
                })
              }
              size="lg"
              className="w-fit"
            >
              Vote A
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">Test image B</h2>

          <Image
            width="400"
            height="400"
            alt="Image Test B"
            className="w-full"
            src={getImageUrl(refImages.current[1])}
          />
          {hasVoted ? (
            <>
              <Progress value={getVotePercent(refImages.current[1])} className="w-full" />
              <div className="text-lg">{getVotesFor(refImages.current[1])} votes</div>
            </>
          ) : (
            <Button
              onClick={() =>
                voteOnThumbnail({
                  thumbnailId: thumbnail._id,
                  imageId: refImages.current[1],
                })
              }
              size="lg"
              className="w-fit"
            >
              Vote B
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { usePaginatedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Doc } from '../../../convex/_generated/dataModel';
import { useSession } from '@clerk/nextjs';

export default function ExplorePage() {
  const {
    results: thumbnails,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.thumbnails.getRecentThumbnails,
    {},
    { initialNumItems: 5 }
  );
  const session = useSession();

  function hasVoted(thumbnail: Doc<'thumbnails'>) {
    if (!session.session) {
      return false;
    }
    return thumbnail.voteIds.includes(session.session?.user?.id);
  }

  return (
    <div>
      <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {thumbnails?.map((thumbnail) => {
          return (
            <Card key={thumbnail._id}>
              <CardHeader>
                <Image
                  src={getImageUrl(thumbnail.aImage)}
                  width="400"
                  height="400"
                  alt="thumbnail image"
                />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center mb-2">
                  <Avatar>
                    <AvatarImage src={thumbnail.profileImage} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p>{thumbnail.title}</p>
                </div>
                <p>
                  {formatDistance(
                    new Date(thumbnail._creationTime),
                    new Date(),
                    {
                      addSuffix: true,
                    }
                  )}
                </p>
                <p>Votes: {thumbnail.aVotes + thumbnail.bVotes}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant={hasVoted(thumbnail) ? 'outline' : 'default'}
                  className="w-full"
                  asChild
                >
                  <Link href={`/thumbnails/${thumbnail._id}`}>
                    {hasVoted(thumbnail) ? 'View Results' : 'Vote'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Button
        className="w-full mb-8"
        disabled={status !== 'CanLoadMore'}
        onClick={() => loadMore(5)}
      >
        Load More
      </Button>
    </div>
  );
}

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createThumbnail = mutation({
  args: {
    title: v.string(),
    aImage: v.string(),
    bImage: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error('You must be logged in to create a thumbnail');
    }

    return await ctx.db.insert('thumbnails', {
      title: args.title,
      userId: user.subject,
      aImage: args.aImage,
      bImage: args.bImage,
      aVotes: 0,
      bVotes: 0,
      voteIds: [],
    });
  }
});

export const voteOnThumbnail = mutation({
  args: {
    thumbnailId: v.id('thumbnails'),
    imageId: v.string(),
  },
  handler: async (ctx, args) => {
    const thumbnail = await ctx.db.get(args.thumbnailId);
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error('You must be logged in to vote');
    }

    if(!thumbnail) {
      throw new Error ('Invalid thumbnail ID');
    }

    if(thumbnail.voteIds.includes(user.subject)) {
      throw new Error ('You already voted');
    }

    if(thumbnail.aImage === args.imageId) {
      thumbnail.aVotes++;
    } else {
      thumbnail.bVotes++;
    }

    await ctx.db.patch(thumbnail._id, {
      aVotes: thumbnail.aVotes,
      bVotes: thumbnail.bVotes,
      voteIds: [...thumbnail.voteIds, user.subject]
    });
  }
});

export const getThumbnail = query({
  args: {
    thumbnailId: v.id('thumbnails'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.thumbnailId);
  }
});

export const getThumbnailsForUser = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query('thumbnails')
      .filter(q => q.eq(q.field('userId'), user.subject))
      .collect();
  }
});

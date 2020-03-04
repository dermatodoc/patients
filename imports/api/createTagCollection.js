import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export default function createTagCollection ( options ) {

  const {
    collection ,
    publication ,
    singlePublication , // optional
    parentPublication ,
    key ,
  } = options ;

  const Collection = new Mongo.Collection(collection);

  if (Meteor.isServer) {
    Meteor.publish(publication, function ( name ) {
      const query = { owner: this.userId } ;
      if (name) query.name = name;
      return Collection.find(query);
    });
    if (singlePublication ) {
      Meteor.publish(singlePublication, function ( name ) {
        return Collection.find({ owner: this.userId , name });
      });
    }
  }

  const operations = {

    options ,

    add: ( owner , name ) => {

      check(owner, String);
      check(name, String);

      name = name.trim();

      const fields = {
        owner,
        name,
      };

      return Collection.upsert( fields, { $set: fields } ) ;

    } ,

    remove: ( owner , name ) => {

      check(owner, String);
      check(name, String);

      name = name.trim();

      const fields = {
        owner,
        name,
      };

      return Collection.remove( fields ) ;

    } ,

    init: ( Parent ) => {

      if (Meteor.isServer) {
        Meteor.publish(parentPublication, function (tag) {
          check(tag, String);
          return Parent.find({ owner: this.userId , [key]: tag });
        });
      }

      Meteor.methods({

        [`${collection}.rename`]: function (tagId, newname){

          check(tagId, String);
          check(newname, String);

          const tag = Collection.findOne(tagId);
          const owner = tag.owner;

          if (owner !== this.userId) throw new Meteor.Error('not-authorized');

          const oldname = tag.name;
          newname = newname.trim();

          Parent.update(
            { owner , [key] : oldname } ,
            {
              $addToSet : { [key] : newname } ,
            } ,
            { multi: true } ,
          );

          Parent.update(
            { owner , [key] : newname } ,
            {
              $pull: { [key]: oldname } ,
            } ,
            { multi: true } ,
          );

          const targetfields = {
            owner,
            name: newname,
          };

          const newfields = {
            ...tag,
            name: newname,
          };

          delete newfields._id;

          Collection.remove(tagId);
          return Collection.upsert( targetfields, { $set: newfields } ) ;

        },

        [`${collection}.delete`]: function (tagId){

          check(tagId, String);

          const tag = Collection.findOne(tagId);
          const owner = tag.owner;

          if (owner !== this.userId) throw new Meteor.Error('not-authorized');

          Parent.update(
            { owner , [key]: tag.name } ,
            { $pull: { [key]: tag.name } } ,
            { multi: true } ,
          );
          return Collection.remove(tagId);
        },

      });

    } ,

  } ;

  return { Collection , operations } ;

}

/**
 * Module dependencies
 */

var  Resource  =  require('deployd/lib/resource'),
     util      =  require('util'),
     zd        =  require('node-zendesk');


function Zendesk() {
 Resource.apply(this, arguments);
 this.client = zd.createClient({
     username: this.config.username,
     token: this.config.token,
     remoteUri: this.config.url
 });
}

util.inherits(Zendesk, Resource);

Zendesk.basicDashboard = {
  settings: [
    {
      name         :  'username',
      type         :  'text',
      description  :  'Zendesk Username'
    },
    {
      name         :  'token',
      type         :  'text',
      description  :  'Zendesk Token'
    },
    {
      name         :  'url',
      type         :  'text',
      description  :  'Zendesk URL'
    }
  ]
};

Zendesk.prototype.clientGeneration = true;

Zendesk.prototype.submit = function(ctx, options) {
  var ticket;
  ticket = {
    ticket: options
  };
  var that = this;
  return this.client.tickets.create(ticket, function(err, req, result)
  {
    if (err !== null) {
      console.error("Zendesk Returned:", err);
      return ctx.done(err);
    }
    return ctx.done(null, result);
  });
};

Zendesk.prototype.handle = function(ctx, next)
{
  if (ctx.req && ctx.req.method !== 'POST')
  {
    return next();
  }

  var options = ctx.body || {};
  var errors = {};
  if (!options.subject)
  {
    errors.subject = "'subject' is required";
  }
  if (!options.comment)
  {
    errors.comment = "'comment' is required";
  }
  if (!options.requester)
  {
    errors.requester = "'requester' is required";
  }
  else
  {
    if (!options.requester.name)
    {
      errors.requester_name = "'requester.name' is required";
    }
    if (!options.requester.email)
    {
      errors.requester_email = "'requester.email' is required";
    }
  }

  if ( Object.keys(errors).length ) {
    return ctx.done({ statusCode: 400, errors: errors });
  }

  return this.submit(ctx, options);
};

module.exports = Zendesk;

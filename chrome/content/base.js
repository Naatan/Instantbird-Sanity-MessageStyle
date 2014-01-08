(function()
{

    var c = {
        saturationAmount: 0.3,
        colorFadeSpeed: 300,
        colorFadeAlpha: 0.2,
        colorFadeDelay: 800,
        maxInsertsPerSec: 5
    };

    /* Insert Animation Limiter - Prevent spamming animations */
    var ial = {
        lastInsert: null,
        noInserts: 0,
        inserTimer: null
    }

    var animateInserts = true;

    /**
     * Add color transitions on newly inserted messages and animate their appearance
     */
    this.onDomInsert = function(aEvent)
    {
        if (!(aEvent.originalTarget instanceof HTMLElement)) return;

        var self = this;
        var node = aEvent.originalTarget;
        var mentions = $(node).find(".ib-nick, .sender");
        mentions.each(function()
        {
            mention = $(this);
            var parent = mention.parent(".container");
            
            // Skip items that for some reason dont supply a color
            if ( ! mention.css("color")) return;

            var color = mention.css("color");
            parent.data("color", color);

            mention.css("color", $.Color(color).saturation(c.saturationAmount).toRgbaString());

            // Add color transitions - fade out bg color on entry,
            // fade in/out on mouse actions
            if (mention.hasClass("sender"))
            {
                self.addColorTransitions(mention, color);
            }

            parent.hide().fadeIn("fast");

            // Workaround bug where jquery for some reason randomly decides not
            // to do the fadein
            setTimeout(function() { parent.show(); }, 500);

            /* Check for repeat insert animations and prevent animating a huge
             * load of inserts in a short amount of time */
            var time = Math.round(new Date().getTime()/1000);
            if (ial.lastInsert == time && ++ial.noInserts == c.maxInsertsPerSec)
            {
                clearTimeout(ial.inserTimer);
                animateInserts = false;
                setTimeout(function()
                {
                    animateInserts = true;
                    ial.noInserts = 0;
                }, 2000);
            }

            ial.lastInsert = time;
        });
    };

    /**
     * Add color transitions to element
     * Fades out BG color on entry
     * Fades BG color on mouse actions
     *
     * @param   {Object} elem  jQuery Element
     * @param   {String} color RGB/HEX Color
     */
    this.addColorTransitions = function(elem, color)
    {
        var parent = elem.parent(".container");
        
        if (animateInserts)
        {
            parent.css("background-color", $.Color(color).alpha(c.colorFadeAlpha).toRgbaString());
            setTimeout(this.colorFade.bind(this, parent), c.colorFadeDelay);
        }

        parent.mouseover(colorFade.bind(this, parent, false));
        parent.mouseout(colorFade.bind(this, parent, true));
    };

    /**
     * Animate the bg color fading in or out
     *
     * @param   {Type} elem    jquery Element
     * @param   {Type} fadeOut Whether to fade in or out
     */
    this.colorFade = function(elem, fadeOut = true)
    {
        var color = elem.data('color');
        color = $.Color(color).alpha(fadeOut ? 0 : c.colorFadeAlpha).toRgbaString();
        $(elem).stop(true, true).animate({backgroundColor: color}, c.colorFadeSpeed)
    }

    var body = document.getElementById("ibcontent");
    body.addEventListener("DOMNodeInserted", this.onDomInsert.bind(this));

}());

import React, { FunctionComponent } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const MarkdownReference: FunctionComponent = () => (
    <div className="prose prose-stone prose-code:before:content-[''] prose-code:after:content-['']">
        <div className="flex flex-col">
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-full table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th
                            className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter"
                            colSpan={2}
                        >
                            markdown cheatsheet
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="px-3" colSpan={2}>
                            markdown is a simple way to format text using only
                            basic characters on your keyboard. while markdown
                            comes in many flavors, this page lists markdown
                            symbols that work on cohost.
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">paragraphs</td>
                        <td>
                            to separate text into paragraphs, leave an empty
                            line between two blocks of text. if you do not leave
                            an empty line between them, pressing enter once will
                            still cause both blocks to be combined onto one
                            line.
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">heading</td>
                        <td>
                            <code>
                                # heading 1 <br /> ## heading 2 <br /> ###
                                heading 3
                            </code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">italic</td>
                        <td>
                            <code>*italic text*</code>
                        </td>
                    </tr>
                    <tr className=" border-b border-longan">
                        <td className=" px-3 font-bold">bold</td>
                        <td>
                            <code>**bold text**</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className=" px-3 font-bold">bold and italic</td>
                        <td>
                            <code>***bold and italic text***</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className=" px-3 font-bold">blockquote</td>
                        <td>
                            <code>
                                &gt; blockquote <br /> &gt;&gt; nested
                                blockquote
                            </code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">strikethrough</td>
                        <td>
                            <code>~~strikethrough~~</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">code</td>
                        <td>
                            <code>`code`</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">ordered list</td>
                        <td>
                            <code>
                                1. list item <br /> 2. list item <br />
                                3. list item
                            </code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">unordered list</td>
                        <td>
                            <code>
                                - egg <br /> - bug <br /> - eggbug
                            </code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">link</td>
                        <td>
                            <code>[link text](http://www.example.com)</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan ">
                        <td className="px-3 font-bold">image</td>
                        <td>
                            <code>![alt text](imagename.jpg)</code>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">line break</td>
                        <td>
                            <code>{`<br />`}</code>, or leave two spaces at the
                            end of a line
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">disable link preview</td>
                        <td>
                            wrap the URL in angle brackets
                            <br />
                            <code>{`<https://www.youtube.com/watch?v=dQw4w9WgXcQ>`}</code>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">footnotes</td>
                        <td>
                            <code>
                                <div>
                                    a sentence with one footnote,[^1] then a
                                    second.[^2]
                                </div>
                                <div>
                                    [^1]: the note text you want to appear at
                                    the bottom of the post
                                </div>
                                <div>
                                    [^2]: the second note text you want to
                                    appear
                                </div>
                            </code>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">highlighting</td>
                        <td>
                            <code>
                                &lt;mark&gt;this text will be highlighted in
                                yellow&lt;/mark&gt;
                            </code>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">subscript</td>
                        <td>
                            <code>
                                &lt;sub&gt;this text will appear as
                                subscript&lt;/sub&gt;
                            </code>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">superscript</td>
                        <td>
                            <code>
                                &lt;sup&gt;this text will appear as
                                superscript&lt;/sup&gt;
                            </code>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">read more</td>
                        <td>
                            <br />
                            <code>---</code>
                            <br />
                            <br />
                            make sure to leave an empty line before and after
                            the dashes!
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">preformatted text</td>
                        <td>
                            <pre className="mr-3">
                                <code>
                                    ```
                                    <br />
                                    place text between two rows of triple
                                    backticks (the ` character, as
                                    <br />
                                    seen above and below) to write preformatted
                                    text. this will prevent
                                    <br />
                                    any symbols inside from being interpreted as
                                    markdown or html. it
                                    <br />
                                    will be displayed exactly as you type it, in
                                    a monospace font, with a
                                    <br />
                                    different color background. this is great
                                    for displaying code!
                                    <br />
                                    ```
                                </code>
                            </pre>
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 font-bold">tables</td>
                        <td>
                            tables are bit too complex for a cheatsheet, but you
                            can read about them{" "}
                            <a
                                href="https://www.markdownguide.org/extended-syntax/#tables"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-full table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter">
                            embedding images
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="px-3">
                            for now, if you want to upload an image to cohost
                            and embed it within your post—rather than at the top
                            of your post—there are a few steps necessary:
                            <ol>
                                <li>
                                    <b>attach the image to your post</b> as if
                                    you were going to include it at the top.
                                </li>
                                <li>
                                    <b>save the post as a draft</b> to finish
                                    uploading the image.
                                </li>
                                <li>
                                    <b>
                                        go to your drafts page and retrieve the
                                        URL for the image
                                    </b>{" "}
                                    from that draft that you want to embed in
                                    your post. you can do this by right-clicking
                                    and opening the image in a new tab or
                                    inspecting the HTML element with the image.
                                </li>
                                <li>
                                    <b>
                                        edit the draft and use this URL for the
                                        image to embed it
                                    </b>{" "}
                                    into your post, either with the markdown
                                    image syntax (see above) or an HTML image
                                    tag (see below.) remember to set the alt
                                    text with a written description!
                                </li>
                                <li>
                                    <b>remove the image attachment</b> from the
                                    top of the post.
                                </li>
                            </ol>
                            <b>be sure not to delete the draft!</b> for privacy
                            and data protection reasons, images not attached to
                            posts are eligible for deletion at a later date. in
                            the future, we intend to replace this method of
                            embedding images with one that does not require you
                            to keep these drafts around—but we're not there yet!
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-full table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th
                            className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter"
                            colSpan={2}
                        >
                            HTML
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="px-3" colSpan={2}>
                            while <b>this cheatsheet will not teach you HTML</b>
                            , here are some basic terms and useful facts about
                            HTML that will help you understand the instructions
                            cheatsheet. if you’re interested in learning HTML,
                            the{" "}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"
                                target="_blank"
                                rel="noreferrer"
                            >
                                MDN HTML Basics page
                            </a>{" "}
                            is a good place to start.
                            <br />
                            <br />
                            <em>
                                if you just want code snippets you can copy and
                                paste, skip down to{" "}
                                <b>
                                    <a href="#snippets">
                                        common formatting & code snippets
                                    </a>
                                </b>
                                .
                            </em>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 text-lg font-semibold" colSpan={2}>
                            HTML glossary
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>HTML element</b>
                        </td>
                        <td>
                            the basic unit of HTML, a paragraph, an image, or a
                            table are all examples of an HTML element. HTML
                            elements can also have “children”, which are other
                            HTML elements contained inside of them.
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>HTML tag</b>
                        </td>
                        <td className="max-w-prose">
                            a tag is a piece of code that begins an HTML
                            element. they are always wrapped in angle brackets,
                            aka <code>&lt;</code> and <code>&gt;</code>. some
                            elements use opening and closing tags, and these
                            elements can have children. closing tags start with{" "}
                            <code>&lt;/</code>. some specific elements do not
                            need a closing tag, and these tags end in{" "}
                            <code>/&gt;</code>.
                            <br />
                            <br />
                            <em>
                                an HTML element for a paragraph, with an opening
                                tag and closing tag:
                            </em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<p>this text is inside the paragraph</p>`}
                                </SyntaxHighlighter>
                            </div>
                            <em>
                                an HTML element for an image, which does not
                                need a closing tag and cannot end, but should
                                end in <code>/&gt;</code>:
                            </em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<img src="https://staging.cohostcdn.org/attachment/d285e796-4c02-4cf8-90ee-18d0867949e5/speedbug.png"
     alt="PUT YOUR ALT TEXT HERE" />`}
                                </SyntaxHighlighter>
                            </div>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>HTML attribute</b>
                        </td>
                        <td className="max-w-prose">
                            an attribute is additional information contained
                            within an HTML tag. you saw two attributes in the
                            example <code>img</code> tag above—<code>src</code>{" "}
                            and <code>alt</code>. some tags require attributes
                            to work. an attribute starts with a name (like{" "}
                            <code>alt</code>) followed by <code>=</code> then
                            the value of the attribute within a pair of{" "}
                            <code>"</code>. so, in the example below,{" "}
                            <code>style</code> is the attribute name, and{" "}
                            <code>color: red;</code> is the attribute value for
                            the <code>style</code> attribute:
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<p style="color: red;">i will be red!</p>`}
                                </SyntaxHighlighter>
                            </div>
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 text-lg font-semibold" colSpan={2}>
                            combining markdown and HTML
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3" colSpan={2}>
                            in most cases, once you open an HTML tag, anything
                            inside that tag will be processed like HTML. you can
                            write text inside no problem, or nest other HTML
                            elements, but{" "}
                            <em>
                                you cannot use markdown inside an HTML element.
                            </em>
                            it won’t cause a bug, but the text inside the HTML
                            element will not be rendered as markdown.
                            <br />
                            <br />
                            you <em>can</em> use markdown in the same post that
                            you use HTML tags, as long as the markdown is
                            outside of any HTML tag.
                            <br />
                            <strong>note:</strong> one bug in embedded HTML
                            handling is how we handle line breaks. if the
                            starting tag of an HTML block is on the same line as
                            text contained in it, line breaks inside the block
                            will be preserved, instead of collapsed.
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-prose table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th
                            className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter"
                            colSpan={2}
                        >
                            CSS
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="max-w-prose px-3" colSpan={2}>
                            most formatting of HTML elements is done with a
                            different language known as CSS. CSS consists
                            primarily of “properties”, which specify what type
                            of formatting you are trying to change, and
                            “property values”, which let you specify how that
                            formatting will appear. for example, to get red
                            text, you would set the <code>color</code> property
                            to the property value <code>red</code>. we will see
                            the syntax for setting properties below. when making
                            your own website, you will often make a separate CSS
                            file, known as a “stylesheet”, then apply the styles
                            in that sheet to matching HTML elements.
                            <br />
                            <br />
                            <b>
                                however, as a cohost user,{" "}
                                <em>you cannot make your own stylesheets</em>,
                                and must write all CSS via
                                <em>“inline CSS.”</em> this is a common source
                                of confusion when trying to read CSS tutorials
                                in order to format your coposts.
                            </b>
                            <br />
                            <br />
                            to write inline CSS, put all of your CSS code within
                            the <code>style</code> attribute of the HTML element
                            you want to format. it's good practice to end each
                            property/value pair with <code>;</code> and it's
                            required to do so to put multiple properties in one
                            HTML <code>style</code> attribute.
                            <br />
                            <br />
                            <em>for example:</em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<p style="color: red;">this text will be red</p>

<p style="color: blue; font-size: 16px; font-weight: bold;">
	this text will be blue, 16px large, and bold
</p>`}
                                </SyntaxHighlighter>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table
                id="snippets"
                className="cohost-shadow-light dark:cohost-shadow-dark w-prose table-auto overflow-hidden rounded-lg bg-notWhite"
            >
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th
                            className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter"
                            colSpan={2}
                        >
                            common formatting & code snippets
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="max-w-prose px-3" colSpan={2}>
                            below are common formatting tasks that you might use
                            HTML and CSS for, and simple code snippets that you
                            can copy and paste to achieve this formatting.
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>centering or aligning text</b>
                        </td>
                        <td className="max-w-prose">
                            to align text, create an HTML element by wrapping it
                            in a <code>&lt;div&gt;</code>,{" "}
                            <code>&lt;span&gt;</code>, <code>&lt;p&gt;</code>,
                            or another similar tag, and add the{" "}
                            <code>style</code> attribute to that element (which
                            allows you to add inline CSS) and make sure that
                            attribute sets the CSS property{" "}
                            <code>text-align</code>. use{" "}
                            <code>text-align: center</code> to horizontally
                            center text, and <code>text-align: right</code> to
                            right-align it. by default, text will be
                            left-aligned.
                            <br />
                            <br />
                            <em>
                                you can copy and paste this code and replace
                                “eggbug” with the text you want to center:
                            </em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<div style="text-align: center;">eggbug!</div>`}
                                </SyntaxHighlighter>
                            </div>
                            you may run into issues if this element is nested
                            within other elements with different alignments or
                            sizes. if you are new to HTML and CSS, you may want
                            to avoid nesting elements when possible!
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>centering images and other HTML elements</b>
                        </td>
                        <td className="max-w-prose">
                            there are two steps to horizontally centering images
                            or other HTML elements:
                            <ol>
                                <li>
                                    create a parent element (such as a{" "}
                                    <code>&lt;div&gt;</code>) with a{" "}
                                    <code>width</code> attribute with the size
                                    you want to center within. often this is{" "}
                                    <code>width=&quot;100%&quot;</code>.
                                </li>
                                <li>
                                    create a child element of that parent
                                    element with a <code>style</code> of{" "}
                                    <code>margin: 0px auto</code>
                                </li>
                            </ol>
                            <em>
                                you can copy and paste this code to make an
                                image and horizontally center it within 100% of
                                the available space, replacing the URL with the
                                URL of your image:
                            </em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<div width=100%>
  <img style="margin: 0px auto;"
       src="https://staging.cohostcdn.org/attachment/d285e796-4c02-4cf8-90ee-18d0867949e5/speedbug.png"
       alt="PUT YOUR ALT TEXT HERE" />
</div>`}
                                </SyntaxHighlighter>
                            </div>
                            you may run into issues if this element is nested
                            within other elements with different alignments or
                            sizes. if you are new to HTML and CSS, you may want
                            to avoid nesting elements more deeply than the
                            example above!
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3 font-bold">
                            <b>collapsible text</b>
                        </td>
                        <td className="max-w-prose">
                            to create a piece of collapsible text in your post
                            that users can open or close, use the{" "}
                            <code>&lt;details&gt;</code> HTML element. inside
                            the <code>&lt;details&gt;</code> element, put the
                            text you want to collapse, and a{" "}
                            <code>&lt;summary&gt;</code> element with the text
                            to show when the element is closed, and at the top
                            of the collapsible element as a header when it is
                            open.
                            <br />
                            <br />
                            <em>
                                you can copy and paste this code, and replace
                                the summary and inside text with your own:
                            </em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<details>
	<summary>Closed Text/Header</summary>
	This text here will not show until the user clicks on the element
</details>`}
                                </SyntaxHighlighter>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-full table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter">
                            cohost-specific HTML & CSS rules
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="px-3">
                            there are some ways that writing HTML and CSS for
                            coposts differs from writing HTML and CSS for your
                            own website. besides requiring you to use inline
                            CSS, certain HTML are CSS features are unavailable
                            due to security concerns. while explaining these
                            features is beyond this cheatsheet, here is a
                            non-comprehensive list of ways that user-defined
                            HTML and CSS are restricted on cohost:
                            <ol>
                                <li>
                                    <p>
                                        you cannot use the CSS property{" "}
                                        <code>position: fixed</code>
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        you cannot use the{" "}
                                        <code>&lt;style&gt;</code> tag
                                    </p>
                                </li>
                                <li>
                                    <p>you cannot make functional HTML forms</p>
                                </li>
                                <li>
                                    <p>
                                        you cannot use CSS custom
                                        properties/custom variables
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        HTML ID attributes may be modified and
                                        should not be relied on
                                    </p>
                                </li>
                            </ol>
                            additionally, it may be helpful to know that the CSS
                            property <code>isolation: isolate</code> applies to
                            all coposts, which affects how <code>z-index</code>{" "}
                            behaves.{" "}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/CSS/isolation"
                                target="_blank"
                                rel="noreferrer"
                            >
                                read more about the <code>isolation</code>{" "}
                                property on MDN
                            </a>
                            .
                        </td>
                    </tr>
                    <tr className="border-b border-longan">
                        <td className="px-3">
                            additionally, the cohost code base includes a number
                            of animations, fonts, and colors that you can use.
                            in particular you can use the following colors:
                            <br />
                            <br />
                            <code>
                                <ol>
                                    <li>--color-cherry</li>
                                    <li>--color-mango</li>
                                    <li>--color-strawberry</li>
                                    <li>--color-longan</li>
                                    <li>--color-notWhite</li>
                                    <li>--color-notBlack</li>
                                </ol>
                            </code>
                            <br />
                            you can use these colors by wrapping them in{" "}
                            <code>rgb(var()))</code>.
                            <br />
                            <br />
                            <em>for example:</em>
                            <div className="mr-3">
                                <SyntaxHighlighter
                                    language="html"
                                    style={gruvboxDark}
                                >
                                    {`<p style="color: rgb(var(--color-cherry));">i will be cherry!</p>`}
                                </SyntaxHighlighter>
                            </div>
                            <br />
                            however, the HTML classes and related CSS styles
                            used for implementing cohost itself are <em>
                                not
                            </em>{" "}
                            a supported, stable API and may change at any time.
                            use them at your own risk.
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="cohost-shadow-light dark:cohost-shadow-dark w-full table-auto overflow-hidden rounded-lg bg-notWhite">
                <thead className="mx-auto bg-longan font-league">
                    <tr>
                        <th className="p-3 font-league text-xl font-semibold leading-6 tracking-tighter">
                            learn more about writing HTML & CSS on cohost
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-notWhite">
                    <tr className="border-b border-longan">
                        <td className="px-3">
                            if you’d like to learn more than this cheatsheet can
                            teach you, cohost user{" "}
                            <a
                                href="https://cohost.org/lexyeevee"
                                target="_blank"
                                rel="noreferrer"
                            >
                                @lexyeevee
                            </a>{" "}
                            has written an excellent multi-part introduction to
                            HTML and CSS for “goofing around on cohost” which
                            you can find{" "}
                            <a
                                href="https://cohost.org/lexyeevee/post/495441-css-for-css-baby-1"
                                target="_blank"
                                rel="noreferrer"
                            >
                                here
                            </a>
                            . you can also use{" "}
                            <a
                                href="https://cloudwithlightning.net/random/chostin/prechoster"
                                target="_blank"
                                rel="noreferrer"
                            >
                                prechoster
                            </a>{" "}
                            by{" "}
                            <a
                                href="https://cohost.org/blep/post/323847-prechoster"
                                target="_blank"
                                rel="noreferrer"
                            >
                                @blep
                            </a>{" "}
                            to write and test your cohost HTML and CSS before
                            posting.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

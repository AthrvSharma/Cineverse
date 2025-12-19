--
-- PostgreSQL database dump
--

\restrict ULfdlLstAmctXPFc6r2DgPXsL5flQaxIygCB80UPUrLbdv4QjikebJsZwiy66OI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cineverse_movies; Type: TABLE; Schema: public; Owner: cineverse_user
--

CREATE TABLE public.cineverse_movies (
    id integer NOT NULL,
    title text NOT NULL,
    poster text NOT NULL,
    backdrop text NOT NULL,
    genres jsonb NOT NULL,
    description text NOT NULL,
    year integer NOT NULL,
    director text NOT NULL,
    cast_members jsonb NOT NULL,
    rating numeric(3,1) NOT NULL,
    runtime text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    trailer_url text DEFAULT ''::text,
    platform text DEFAULT 'Featured'::text
);


ALTER TABLE public.cineverse_movies OWNER TO cineverse_user;

--
-- Name: cineverse_movies_id_seq; Type: SEQUENCE; Schema: public; Owner: cineverse_user
--

CREATE SEQUENCE public.cineverse_movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cineverse_movies_id_seq OWNER TO cineverse_user;

--
-- Name: cineverse_movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cineverse_user
--

ALTER SEQUENCE public.cineverse_movies_id_seq OWNED BY public.cineverse_movies.id;


--
-- Name: cineverse_movies id; Type: DEFAULT; Schema: public; Owner: cineverse_user
--

ALTER TABLE ONLY public.cineverse_movies ALTER COLUMN id SET DEFAULT nextval('public.cineverse_movies_id_seq'::regclass);


--
-- Data for Name: cineverse_movies; Type: TABLE DATA; Schema: public; Owner: cineverse_user
--

COPY public.cineverse_movies (id, title, poster, backdrop, genres, description, year, director, cast_members, rating, runtime, created_at, trailer_url, platform) FROM stdin;
10	John Wick: Chapter 2	https://m.media-amazon.com/images/S/pv-target-images/267b106c482a9d87f4a68f4d95b737571ef5ef8c4241713119526e9578498bce.jpg	https://m.media-amazon.com/images/S/pv-target-images/b2f5d1415812459a4e16d54b4d788ae01b3e57b979108664f7fe1d617c06fa75._SX1080_FMpng_.png	["Action", "Thriller"]	John Wick returns to battle new enemies.	2017	Chad Stahelski	["Keanu Reeves"]	7.5	122	2025-11-21 10:13:07.494412+05:30		Prime Video
2	Predator: Badlands	https://cms-assets.webediamovies.pro/cdn-cgi/image/dpr=1,fit=scale-down,gravity=auto,metadata=none,quality=85,width=2500/production/365/b91d19e4833cdc0865b3a04ed98f1f4d.jpg	https://cdn.district.in/movies-assets/images/cinema/Predator--Badlands-5f3fd810-20e3-11f0-a524-07b7a1c242ef.jpg	["Sci-fi", "Horror"]	Cast out from its clan, an alien hunter and an unlikely ally embark on a treacherous journey in search of the ultimate adversary.	2025	Dan Trachtenberg	["Elle Fanning; Dimitrius Schuster-Koloamatangi"]	7.5	1h 47m	2025-11-17 18:31:29.751084+05:30	https://www.youtube.com/embed/43R9l7EkJwE?si=NTSnf00RqXmeeA7Y	Netflix
1	sdafe	https://m.media-amazon.com/images/S/pv-target-images/f5af184404f22183d9511e2baff600f18d32277ed826ff23a815a9129d3c8f2b.jpg	https://m.media-amazon.com/images/S/pv-target-images/24cc0f3990ef47a4237795e4634e17df64507c8f641b51ecbd307011ca574e03._SX1080_FMjpg_.jpg	["Action", "Adventure", "Thriller"]	afeqg	2312	Paco Plaza	["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"]	5.9	2h 49m	2025-11-17 11:02:52.706852+05:30		Prime Video
4	Inception	https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg	https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg	["Sci-Fi", "Thriller", "Action"]	A thief who steals corporate secrets through dream-sharing technology must plant an idea.	2010	Christopher Nolan	["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"]	8.8	148	2025-11-21 10:13:07.494412+05:30		Netflix
6	Avatar	https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg	https://image.tmdb.org/t/p/original/4Iu5f2nv7huqvuYkmZv4o2TJ5cT.jpg	["Sci-Fi", "Adventure"]	A paraplegic Marine becomes torn between following orders and protecting a new world.	2009	James Cameron	["Sam Worthington", "Zoe Saldana"]	7.8	162	2025-11-21 10:13:07.494412+05:30		Disney+
7	Avengers: Endgame	https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg	https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg	["Action", "Sci-Fi", "Adventure"]	The Avengers assemble once more to reverse Thanos' actions and restore order.	2019	Anthony Russo	["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"]	8.4	181	2025-11-21 10:13:07.494412+05:30		Disney+
9	John Wick	https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg	https://image.tmdb.org/t/p/original/yY76zq9XSuJ4nWyPDuwkdV7Wt0c.jpg	["Action", "Thriller"]	A retired hitman seeks vengeance for the killing of his dog.	2014	Chad Stahelski	["Keanu Reeves"]	7.4	101	2025-11-21 10:13:07.494412+05:30		Prime Video
11	John Wick: Chapter 3	https://image.tmdb.org/t/p/w500/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg	https://image.tmdb.org/t/p/original/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg	["Action", "Thriller"]	John Wick is on the run with a $14 million bounty.	2019	Chad Stahelski	["Keanu Reeves"]	7.4	130	2025-11-21 10:13:07.494412+05:30		Prime Video
15	The Matrix Revolutions	https://image.tmdb.org/t/p/w500/fgm8OZ7o4G1G1I9EeGcb85Noe6L.jpg	https://image.tmdb.org/t/p/original/4BVXKpZJ2Z5pucs5cjox96D65Vq.jpg	["Sci-Fi", "Action"]	Humanity faces its final battle.	2003	Lana Wachowski	["Keanu Reeves"]	6.7	129	2025-11-21 10:13:07.494412+05:30		Netflix
12	Mission Impossible Fallout	https://m.media-amazon.com/images/M/MV5BZmUwZTg2YmMtMmZjOS00ZDYwLWI2ZDgtZDcyY2ZmMWMwZDdlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://m.media-amazon.com/images/S/pv-target-images/4b00c6296bc7252c533c0f5b913e8659eab6763eecfca36df9965ee43b8ba46e._SX1080_FMjpg_.jpg	["Action", "Adventure", "Thriller"]	Ethan Hunt must stop a global nuclear threat.	2018	Christopher McQuarrie	["Tom Cruise", "Henry Cavill"]	7.7	147	2025-11-21 10:13:07.494412+05:30		Prime Video
14	The Matrix Reloaded	https://m.media-amazon.com/images/M/MV5BNjAxYjkxNjktYTU0YS00NjFhLWIyMDEtMzEzMTJjMzRkMzQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://media.gq-magazine.co.uk/photos/646c9413b4c3aec3e98eae2b/16:9/w_1920,h_1080,c_limit/The-matrix-reloaded-HP.jpg	["Sci-Fi", "Action"]	The war between humans and machines continues.	2003	Lana Wachowski	["Keanu Reeves"]	7.2	138	2025-11-21 10:13:07.494412+05:30		Netflix
16	Gladiator	https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_.jpg	https://m.media-amazon.com/images/S/pv-target-images/f1ccd052f98d88c17c60d728abdb56dd0dacbc23957633567f6d354772bcc666._SX1080_FMjpg_.jpg	["Action", "Drama"]	A Roman general seeks revenge after betrayal.	2000	Ridley Scott	["Russell Crowe", "Joaquin Phoenix"]	8.5	155	2025-11-21 10:13:07.494412+05:30		Netflix
3	The Dark Knight	https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg	https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/5313/1734078555313-i	["Action", "Crime", "Drama"]	Batman faces the Joker — a criminal mastermind who plunges Gotham into chaos.	2008	Christopher Nolan	["Christian Bale", "Heath Ledger", "Aaron Eckhart"]	9.0	152	2025-11-21 10:13:07.494412+05:30		Netflix
13	The Matrix	https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg	https://m.media-amazon.com/images/M/MV5BNjAxYjkxNjktYTU0YS00NjFhLWIyMDEtMzEzMTJjMzRkMzQ1XkEyXkFqcGc@._V1_.jpg	["Sci-Fi", "Action"]	A hacker discovers reality is a simulation.	1999	Lana Wachowski	["Keanu Reeves", "Laurence Fishburne"]	8.7	136	2025-11-21 10:13:07.494412+05:30		Netflix
5	Interstellar	https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://images.bauerhosting.com/legacy/empire-tmdb/films/157336/images/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80	["Sci-Fi", "Adventure", "Drama"]	A group of explorers travel through a wormhole to save humanity.	2014	Christopher Nolan	["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]	8.6	169	2025-11-21 10:13:07.494412+05:30		Netflix
8	Iron Man	https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg	https://img10.hotstar.com/image/upload/f_auto,q_auto/sources/r1/cms/prod/9337/809337-i	["Action", "Sci-Fi"]	A billionaire builds a powered suit of armor to fight evil.	2008	Jon Favreau	["Robert Downey Jr.", "Gwyneth Paltrow"]	7.9	126	2025-11-21 10:13:07.494412+05:30		Disney+
17	Joker	https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg	https://image.tmdb.org/t/p/original/ygf7Phpee7M2yMLef7qt3ykRSYV.jpg	["Crime", "Drama"]	A mentally troubled comedian descends into madness.	2019	Todd Phillips	["Joaquin Phoenix"]	8.4	122	2025-11-21 10:13:07.494412+05:30		Netflix
18	Dune	https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg	https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg	["Sci-Fi", "Adventure"]	A gifted young man travels to a dangerous desert planet.	2021	Denis Villeneuve	["Timothée Chalamet", "Zendaya"]	8.1	155	2025-11-21 10:13:07.494412+05:30		HBO
24	Logan	https://image.tmdb.org/t/p/w500/fnbjcRDYn6YviCcePDnGdyAkYsB.jpg	https://image.tmdb.org/t/p/original/3RxwzT2xCi5PEP71mChRKtHyac6.jpg	["Action", "Drama"]	An aging Wolverine protects a young mutant.	2017	James Mangold	["Hugh Jackman"]	8.1	137	2025-11-21 10:13:07.494412+05:30		Disney+
35	The Social Network	https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg	https://image.tmdb.org/t/p/original/3n5fl85N2zE41FVvq0MyoVo9zcG.jpg	["Drama"]	The founding of Facebook and its legal battles.	2010	David Fincher	["Jesse Eisenberg", "Andrew Garfield"]	7.7	120	2025-11-21 10:13:07.494412+05:30		Netflix
36	Parasite	https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg	https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg	["Drama", "Thriller"]	A poor family infiltrates a wealthy household.	2019	Bong Joon-ho	["Song Kang-ho"]	8.6	132	2025-11-21 10:13:07.494412+05:30		Prime Video
38	Mad Max Fury Road	https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg	https://image.tmdb.org/t/p/original/dq18nCTTLpy9PmtzZI6Y2yAgdw5.jpg	["Action", "Adventure"]	A woman rebels against a tyrant in a post-apocalyptic world.	2015	George Miller	["Tom Hardy", "Charlize Theron"]	8.1	120	2025-11-21 10:13:07.494412+05:30		HBO
20	Oppenheimer	https://images.justwatch.com/poster/305252655/s718/oppenheimer.jpg	https://m.media-amazon.com/images/M/MV5BZWFhNThmNjEtY2ZhNy00MDRhLTkwYTEtMWQwOTA5NDhlZWRlXkEyXkFqcGdeQVRoaXJkUGFydHlJbmdlc3Rpb25Xb3JrZmxvdw@@._V1_.jpg	["Drama", "History"]	The father of the atomic bomb faces the consequences.	2023	Christopher Nolan	["Cillian Murphy", "Emily Blunt"]	8.3	180	2025-11-21 10:13:07.494412+05:30		Prime Video
21	Barbie	https://m.media-amazon.com/images/M/MV5BYjI3NDU0ZGYtYjA2YS00Y2RlLTgwZDAtYTE2YTM5ZjE1M2JlXkEyXkFqcGc@._V1_.jpg	https://m.media-amazon.com/images/M/MV5BNGY0ZjA3MzAtYjIwOS00NTk5LThmMzEtNjI0MmU4MzQ1NmRiXkEyXkFqcGdeQWFybm8@._V1_.jpg	["Comedy", "Fantasy"]	Barbie ventures into the real world and discovers its flaws.	2023	Greta Gerwig	["Margot Robbie", "Ryan Gosling"]	7.0	114	2025-11-21 10:13:07.494412+05:30		Prime Video
22	Deadpool	https://m.media-amazon.com/images/S/pv-target-images/d5bb4b503a49fac432cf9f165c331f2dbff6d8e6419440be30bef0d201361dfc.jpg	https://lumiere-a.akamaihd.net/v1/images/image_299ffd51.jpeg?region=0,0,1800,968	["Action", "Comedy"]	A former soldier becomes the antihero Deadpool.	2016	Tim Miller	["Ryan Reynolds"]	8.0	108	2025-11-21 10:13:07.494412+05:30		Disney+
23	Deadpool 2	https://m.media-amazon.com/images/S/pv-target-images/217fbc9c8fc937c0b022b0455a023d1da595a65edaf4dc44d33d12d465a97fc6.jpg	https://statcdn.fandango.com/MPX/image/NBCU_Fandango/189/99/thumb_9FEFD96C-0D99-43B3-B4E4-D56FE1EB4532.jpg	["Action", "Comedy"]	Deadpool forms his own team to protect a young mutant.	2018	David Leitch	["Ryan Reynolds"]	7.7	120	2025-11-21 10:13:07.494412+05:30		Disney+
34	The Prestige	https://images.moviesanywhere.com/4d9df0e6b0bd732b3d1fa967b5b919fa/1adaca39-ae5e-4867-91fd-6025d3d08eb4.jpg	https://images.bauerhosting.com/legacy/empire-tmdb/films/1124/images/c5o7FN2vzI7xlU6IF1y64mgcH9E.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80	["Drama", "Mystery", "Sci-Fi"]	Two rival magicians clash.	2006	Christopher Nolan	["Hugh Jackman", "Christian Bale"]	8.5	130	2025-11-21 10:13:07.494412+05:30		Prime Video
28	Fight Club	https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://media.newyorker.com/photos/5dbafcc91b4a6700085a7a9b/master/pass/Baker-FightClub.jpg	["Drama", "Thriller"]	A man finds relief in an underground fight club.	1999	David Fincher	["Brad Pitt", "Edward Norton"]	8.8	139	2025-11-21 10:13:07.494412+05:30		Netflix
39	Whiplash	https://m.media-amazon.com/images/S/pv-target-images/124df3b92ceed98bbd0dbb0a786e097d25686706f5521a2c4f4d48586d41a556.jpg	https://m.media-amazon.com/images/S/pv-target-images/9f6922b1d34bbecebc225098f50d8a8f5f744496aaeed573e96071a77b33108a._SX1080_FMjpg_.jpg	["Drama", "Music"]	A young drummer is pushed to his limits by a ruthless instructor.	2014	Damien Chazelle	["Miles Teller", "J.K. Simmons"]	8.5	107	2025-11-21 10:13:07.494412+05:30		Prime Video
26	The Batman	https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg	https://m.media-amazon.com/images/S/pv-target-images/81ef275effa427553a847bc220bebe1dc314b2e79d00333f94a6bcadd7cce851.jpg	["Action", "Crime"]	Batman uncovers corruption in Gotham.	2022	Matt Reeves	["Robert Pattinson"]	7.8	175	2025-11-21 10:13:07.494412+05:30		Netflix
25	Spider-Man No Way Home	https://m.media-amazon.com/images/S/pv-target-images/e517ef1200967f6a07bad241d66d0c59a2941e54110fcd7ed4926a9d83cdc636.jpg	https://images.indianexpress.com/2021/11/spider-man-no-way-home-1200-2.jpg	["Action", "Adventure", "Sci-Fi"]	Peter Parker opens the multiverse, causing chaos.	2021	Jon Watts	["Tom Holland", "Zendaya"]	8.2	148	2025-11-21 10:13:07.494412+05:30		Disney+
30	The Shawshank Redemption	https://image.tmdb.org/t/p/w500/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg	https://m.media-amazon.com/images/S/pv-target-images/6e3e579706908883944a6a0711295c8ef16fa7c9122e48d076a465e1464952bc._SX1080_FMjpg_.jpg	["Drama"]	Two imprisoned men form a lifelong bond.	1994	Frank Darabont	["Morgan Freeman", "Tim Robbins"]	9.3	142	2025-11-21 10:13:07.494412+05:30		Netflix
32	The Godfather Part II	https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://m.media-amazon.com/images/S/pv-target-images/111135eb34a021b419d09f2f149f3221e593a31e8d4bc27eec679fb9dd4768ee.jpg	["Crime", "Drama"]	Michael Corleone expands his family’s empire.	1974	Francis Ford Coppola	["Al Pacino", "Robert De Niro"]	9.0	202	2025-11-21 10:13:07.494412+05:30		Netflix
33	Pulp Fiction	https://m.media-amazon.com/images/S/pv-target-images/541b7d586b6a736467d773f36e8f878a8f4f56e6de63ab8fd33d1dfd9feb5f34.jpg	https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABdMuG4ulvXfNer1X68xNJiolDTQr738xn-HYnLy3MXziTCm88GHdXDlk8yw9aCqtnzHhA6IGfghRFdkE8YORzy7AolXuFXA3W3-E.jpg?r=aab	["Crime", "Drama"]	The lives of several criminals intertwine.	1994	Quentin Tarantino	["John Travolta", "Samuel L. Jackson"]	8.9	154	2025-11-21 10:13:07.494412+05:30		Netflix
40	La La Land	https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg	https://image.tmdb.org/t/p/original/2jVVDtDaeMxmcvrz2SNyhMcYtWf.jpg	["Drama", "Romance"]	A pianist and an actress pursue dreams in LA.	2016	Damien Chazelle	["Emma Stone", "Ryan Gosling"]	8.0	128	2025-11-21 10:13:07.494412+05:30		Netflix
42	Tenet	https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg	https://image.tmdb.org/t/p/original/7NrR0RvrRZtGJPD7W82dManIeZc.jpg	["Action", "Sci-Fi"]	A secret agent manipulates time to prevent catastrophe.	2020	Christopher Nolan	["John David Washington", "Robert Pattinson"]	7.4	150	2025-11-21 10:13:07.494412+05:30		HBO
43	Shutter Island	https://image.tmdb.org/t/p/w500/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg	https://image.tmdb.org/t/p/original/xDQS9xUVdPIRtnRaJz0K34XM8Xy.jpg	["Thriller", "Mystery"]	A U.S. Marshal investigates a psychiatric facility.	2010	Martin Scorsese	["Leonardo DiCaprio", "Mark Ruffalo"]	8.2	138	2025-11-21 10:13:07.494412+05:30		Netflix
44	Inglourious Basterds	https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg	https://image.tmdb.org/t/p/original/bYR8dE1fWoy1zfavP3FBhQJzmZQ.jpg	["War", "Drama", "Crime"]	A group of soldiers plot to assassinate Nazi leaders.	2009	Quentin Tarantino	["Brad Pitt"]	8.3	153	2025-11-21 10:13:07.494412+05:30		Netflix
48	Jojo Rabbit	https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieeN.jpg	https://image.tmdb.org/t/p/original/1ltToqKmR15PMCTcTxhU4AAvVxG.jpg	["Comedy", "Drama", "War"]	A boy discovers his mother is hiding a Jewish girl.	2019	Taika Waititi	["Roman Griffin Davis", "Scarlett Johansson"]	7.9	108	2025-11-21 10:13:07.494412+05:30		Prime Video
49	1917	https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg	https://image.tmdb.org/t/p/original/A75YFqUJvheoJA8rZYNJSeW5uGq.jpg	["War", "Drama"]	Two soldiers are sent on a dangerous mission during WWI.	2019	Sam Mendes	["George MacKay"]	8.3	119	2025-11-21 10:13:07.494412+05:30		Prime Video
54	The Imitation Game	https://image.tmdb.org/t/p/w500/zSqJ1qFq8NXFfi7JeIYMlzyR0dx.jpg	https://image.tmdb.org/t/p/original/bOFaAXm4rQFqsFbaKMcLfuvR8AH.jpg	["Drama", "History"]	Alan Turing cracks the German Enigma code.	2014	Morten Tyldum	["Benedict Cumberbatch", "Keira Knightley"]	8.0	113	2025-11-21 10:13:07.494412+05:30		Netflix
58	A Beautiful Mind	https://image.tmdb.org/t/p/w500/zwzWCmH72OSC9NA0ipoqw5Zjya8.jpg	https://image.tmdb.org/t/p/original/plcZAFKagWQ0c4r9Y8Vfsb7cBCv.jpg	["Drama", "Romance"]	A brilliant mathematician struggles with schizophrenia.	2001	Ron Howard	["Russell Crowe", "Jennifer Connelly"]	8.2	135	2025-11-21 10:13:07.494412+05:30		Prime Video
56	The Pursuit of Happyness	https://m.media-amazon.com/images/S/pv-target-images/d34e6dcf54f492e9fd5306cd7e1543eb3eeaade546b98f59eda6b2fd2b331782.jpg	https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABUF7yTkF1E_mEGYmy8vkYyV8uhGlzKN8pUJSAaPj8ZA_7bLBeFENfQYOIteJlqr98nIONqTaUT9k1sqj3lfwsVRi8P5_g86d4lKU.jpg?r=6f3	["Drama"]	A struggling salesman takes custody of his son.	2006	Gabriele Muccino	["Will Smith", "Jaden Smith"]	8.0	117	2025-11-21 10:13:07.494412+05:30		Netflix
53	Gravity	https://m.media-amazon.com/images/M/MV5BNjE5MzYwMzYxMF5BMl5BanBnXkFtZTcwOTk4MTk0OQ@@._V1_FMjpg_UX1000_.jpg	https://m.media-amazon.com/images/S/pv-target-images/8b009972d7138380927c39bae4a6607e8b4c42b4d2a08ae5008e0c6e01460da6.jpg	["Sci-Fi", "Thriller"]	Two astronauts struggle to survive in space.	2013	Alfonso Cuarón	["Sandra Bullock", "George Clooney"]	7.7	91	2025-11-21 10:13:07.494412+05:30		Netflix
19	Dune Part Two	https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg	https://m.media-amazon.com/images/S/pv-target-images/d0cd87e3ab34757a30991b43538393b7afb1840c976e96bc0f70332e039177bb.jpg	["Sci-Fi", "Adventure"]	Paul Atreides fights to unite the Fremen and avenge his family.	2024	Denis Villeneuve	["Timothée Chalamet", "Zendaya"]	8.8	166	2025-11-21 10:13:07.494412+05:30		Netflix
45	Django Unchained	https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_.jpg	https://m.media-amazon.com/images/S/pv-target-images/00d8d53bbef88370084ddcad59c7c25c2283b819916da02ab000a5636c9d205a._SX1080_FMjpg_.jpg	["Drama", "Western"]	A freed slave sets out to rescue his wife.	2012	Quentin Tarantino	["Jamie Foxx", "Leonardo DiCaprio"]	8.4	165	2025-11-21 10:13:07.494412+05:30		Netflix
57	The Truman Show	https://m.media-amazon.com/images/M/MV5BNzA3ZjZlNzYtMTdjMy00NjMzLTk5ZGYtMTkyYzNiOGM1YmM3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABZICByL_wNu_f9VvDyJ6mCDgPdHHmejFqzm0YycgfXuuBB8yn3zEhBf_gBfsRZPtxwq_IXapsahyhtmpvEz27hqf-2ocLHNkHrez.jpg?r=9cd	["Drama", "Comedy"]	A man discovers his life is a reality TV show.	1998	Peter Weir	["Jim Carrey"]	8.2	103	2025-11-21 10:13:07.494412+05:30		Netflix
27	The Wolf of Wall Street	https://images.justwatch.com/poster/323056248/s718/the-wolf-of-wall-street.jpg	https://m.media-amazon.com/images/S/pv-target-images/6339b2ca08e537a828d47b78c4a0b1ed312416599ca5f238ef7235b5a5a7b06c._SX1080_FMjpg_.jpg	["Comedy", "Drama", "Crime"]	Jordan Belfort's rise and fall on Wall Street.	2013	Martin Scorsese	["Leonardo DiCaprio", "Jonah Hill"]	8.2	180	2025-11-21 10:13:07.494412+05:30		Netflix
46	No Country for Old Men	https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_FMjpg_UX1000_.jpg	https://m.media-amazon.com/images/S/pv-target-images/447643c10d14d46ff6dadaa64a9c672fe58354db4724247fc6c68ddc04cc3523.jpg	["Thriller", "Crime"]	A hunter finds cash from a drug deal gone wrong.	2007	Ethan Coen	["Javier Bardem"]	8.1	122	2025-11-21 10:13:07.494412+05:30		Prime Video
50	Blade Runner 2049	https://m.media-amazon.com/images/S/pv-target-images/f1086d226f96a03f0c655c253bcbf2bbfd14709f35c313b02d5bf8b0437ce633.jpg	https://occ-0-8407-2218.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABaHT4U_VI3Hpghhv_yb3A98yiUsAK8a5E3lkBU9zp88a0HprtBtvvbcCwXhfxR_9xqQfkzY9hwKe8G3S5TwNT7J9hpwRuDk8zyeD.jpg?r=ad3	["Sci-Fi", "Drama"]	A young blade runner discovers a buried secret.	2017	Denis Villeneuve	["Ryan Gosling", "Harrison Ford"]	8.0	163	2025-11-21 10:13:07.494412+05:30		Netflix
47	Knives Out	https://m.media-amazon.com/images/M/MV5BZDU5ZTRkYmItZjg0Mi00ZTQwLThjMWItNWM3MTMxMzVjZmVjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	https://ntvb.tmsimg.com/assets/p16981625_v_h8_ae.jpg?w=1280&h=720	["Comedy", "Crime", "Mystery"]	A detective investigates a wealthy family's patriarch’s death.	2019	Rian Johnson	["Daniel Craig", "Ana de Armas"]	7.9	130	2025-11-21 10:13:07.494412+05:30		Prime Video
52	Arrival	https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_.jpg	https://occ-0-8407-2218.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABSGPfRWAUqxiKBQddEmYanV4OnBsuU0xG9xMHYSwcuPYy-rdElqCnyAAt0iK46wRVON58L5CGD-wqSP4p7nMgmepLIVb9cwmAB7k.jpg?r=8b2	["Sci-Fi", "Drama"]	A linguist communicates with extraterrestrials.	2016	Denis Villeneuve	["Amy Adams", "Jeremy Renner"]	8.0	116	2025-11-21 10:13:07.494412+05:30		Netflix
55	The Grand Budapest Hotel	https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_FMjpg_UX1000_.jpg	https://static01.nyt.com/images/2014/03/05/multimedia/budapest-anatomy/budapest-anatomy-superJumbo.jpg?auto=webp&quality=30&disable=upscale&format=pjpg	["Comedy", "Drama"]	The adventures of a legendary concierge.	2014	Wes Anderson	["Ralph Fiennes", "Tony Revolori"]	8.1	100	2025-11-21 10:13:07.494412+05:30		Prime Video
41	The Revenant	https://lumiere-a.akamaihd.net/v1/images/revenant_584x800_6d98d1b6.jpeg	https://m.media-amazon.com/images/S/pv-target-images/3c5ea197f5c4f5d470b15e183d5b90192611e46c3ab7f20ff29d0c815a9688e5._SX1080_FMjpg_.jpg	["Adventure", "Drama"]	A frontiersman fights for survival after being left for dead.	2015	Alejandro G. Iñárritu	["Leonardo DiCaprio"]	8.0	156	2025-11-21 10:13:07.494412+05:30		Netflix
37	The Irishman	https://m.media-amazon.com/images/M/MV5BMTY2YThkNmQtOWJhYy00ZDc3LWEzOGEtMmQwNzM0YjFmZWIyXkEyXkFqcGc@._V1_.jpg	https://m.media-amazon.com/images/M/MV5BZmUyNjdhODItNDBlZC00NjMzLWJlMDYtNzhmNjQ1M2JiYmM2XkEyXkFqcGc@._V1_.jpg	["Crime", "Drama"]	A mob hitman recalls decades of crime.	2019	Martin Scorsese	["Robert De Niro", "Joe Pesci", "Al Pacino"]	7.9	209	2025-11-21 10:13:07.494412+05:30		Netflix
51	Her	https://m.media-amazon.com/images/S/pv-target-images/c9a3ccf3a245f5df023ffc7007d93af8645dddc5a9f6e93412e1b00d7b744836.jpg	https://m.media-amazon.com/images/S/pv-target-images/f5d7e2b7829e13b035056c3b5b5a73b1af4a89ca8914113c498b7dbe05d48e12._SX1080_FMjpg_.jpg	["Drama", "Romance", "Sci-Fi"]	A man develops a relationship with an AI.	2013	Spike Jonze	["Joaquin Phoenix", "Scarlett Johansson"]	8.0	126	2025-11-21 10:13:07.494412+05:30		Netflix
31	The Godfather	https://m.media-amazon.com/images/S/pv-target-images/5bc7a0cbcc18491a4465ea2c90591d1435a20bbc62ac115dad9aa2e2252eaea6.jpg	https://media.vanityfair.com/photos/5f51362fb9d628c9983c862a/master/pass/Godfather3_Still_PK_CN-3099_d0919a8cdafaf71f5be4a36f3ff2f19214a1f847[1].jpg	["Crime", "Drama"]	An organized crime dynasty's aging patriarch transfers control.	1972	Francis Ford Coppola	["Marlon Brando", "Al Pacino"]	9.2	175	2025-11-21 10:13:07.494412+05:30		Netflix
29	Forrest Gump	https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg	https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABStZ5YEGbgUvdwdIFn6oZDFp-hHad1D90PwJhBNszfjw9HpmB9jh3bSI5oUho4TfU1uLs_3jmqczRSD9XOhrNi4FyggbbX0DBWTZ.jpg?r=d5f	["Drama", "Romance"]	Forrest Gump witnesses key moments in history.	1994	Robert Zemeckis	["Tom Hanks", "Robin Wright"]	8.8	142	2025-11-21 10:13:07.494412+05:30		Netflix
\.


--
-- Name: cineverse_movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cineverse_user
--

SELECT pg_catalog.setval('public.cineverse_movies_id_seq', 58, true);


--
-- Name: cineverse_movies cineverse_movies_pkey; Type: CONSTRAINT; Schema: public; Owner: cineverse_user
--

ALTER TABLE ONLY public.cineverse_movies
    ADD CONSTRAINT cineverse_movies_pkey PRIMARY KEY (id);


--
-- Name: cineverse_movies cineverse_movies_title_key; Type: CONSTRAINT; Schema: public; Owner: cineverse_user
--

ALTER TABLE ONLY public.cineverse_movies
    ADD CONSTRAINT cineverse_movies_title_key UNIQUE (title);


--
-- Name: idx_cineverse_movies_director; Type: INDEX; Schema: public; Owner: cineverse_user
--

CREATE INDEX idx_cineverse_movies_director ON public.cineverse_movies USING btree (director);


--
-- Name: idx_cineverse_movies_genres; Type: INDEX; Schema: public; Owner: cineverse_user
--

CREATE INDEX idx_cineverse_movies_genres ON public.cineverse_movies USING gin (genres);


--
-- Name: idx_cineverse_movies_platform; Type: INDEX; Schema: public; Owner: cineverse_user
--

CREATE INDEX idx_cineverse_movies_platform ON public.cineverse_movies USING btree (platform);


--
-- Name: idx_cineverse_movies_year; Type: INDEX; Schema: public; Owner: cineverse_user
--

CREATE INDEX idx_cineverse_movies_year ON public.cineverse_movies USING btree (year DESC);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO cineverse_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO cineverse_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO cineverse_user;


--
-- PostgreSQL database dump complete
--

\unrestrict ULfdlLstAmctXPFc6r2DgPXsL5flQaxIygCB80UPUrLbdv4QjikebJsZwiy66OI

